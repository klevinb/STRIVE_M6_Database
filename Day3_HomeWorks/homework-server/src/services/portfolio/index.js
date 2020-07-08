const express = require("express")
const fs = require("fs-extra")
const path = require("path")
const uniqid = require("uniqid")
const multer = require("multer")
const ProjectSchema = require("./schema")
const { find } = require("./schema")

const router = express.Router()
const upload = multer()

const reviewsFilePath = path.join(__dirname, "reviews.json")

const projectsImagePath = path.join(__dirname, "../../public/img/projects")

const getReviews = () => {
    const reviewsAsBuffer = fs.readFileSync(reviewsFilePath)
    const reviews = JSON.parse(reviewsAsBuffer.toString())
    return reviews
}


router.get("/", async (req, res, next) => {
    try {
        const projects = await ProjectSchema.find({})
        if (projects) {
            res.status(200).send(projects)
        } else {
            const error = new Error()
            error.httpStatusCode = 404
            error.message = "We dont have any data!"
            next(error)
        }
    } catch (error) {
        next(error)
    }
})

router.get("/:id", (req, res, next) => {
    const portfolios = getPortfolios()
    if (portfolios.length > 0) {
        const portfolio = portfolios.filter(portfolio => portfolio.id === req.params.id)
        if (portfolio.length > 0) {
            res.status(200).send(portfolio)
        } else {
            const error = new Error()
            error.httpStatusCode = 404
            error.message = "We cannot find a project with this ID"
            next(error)
        }
    } else {
        const error = new Error()
        error.httpStatusCode = 404
        error.message = "We dont have any data!"
        next(error)
    }
})

router.get("/:id/getPhoto", (req, res) => {
    const source = fs.createReadStream(path.join(projectsImagePath, `${req.params.id}.png`))
    source.pipe(res)
})

router.get("/:id/download", (req, res) => {
    const source = fs.createReadStream(path.join(projectsImagePath, `${req.params.id}.png`))
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${req.params.id}.png`
    )
    source.pipe(res)
})

router.post("/", (req, res) => {

    newPortfolio = { id: uniqid(), ...req.body, createdAt: new Date() }
    const portfolios = getPortfolios()
    portfolios.push(newPortfolio)
    fs.writeFileSync(portfoliosFilePath, JSON.stringify(portfolios))

    const filteredStudents = students.filter(student => student.id !== req.body.studentId)
    const addStudentProjectNr = students.filter(student => student.id === req.body.studentId)
    addStudentProjectNr[0].numberOfProjects++

    filteredStudents.push(addStudentProjectNr[0])

    fs.writeFileSync(studentsFilePath, JSON.stringify(filteredStudents))

    res.status(201).send(portfolios)

})

router.post("/:id/reviews", async (req, res) => {
    const newReview = { ...req.body, projectId: req.params.id, date: new Date() }
    const reviews = getReviews()

    reviews.push(newReview)
    fs.writeFile(reviewsFilePath, JSON.stringify(reviews))
    res.status(201).send(newReview)
})

router.get("/:id/reviews", async (req, res) => {
    const reviews = getReviews()
    const filteredReviews = reviews.filter(review => review.projectId === req.params.id)

    res.status(200).send(filteredReviews)
})

router.post("/:id/uploadPhoto", upload.single("project"), async (req, res, next) => {
    try {
        await fs.writeFile(path.join(projectsImagePath, `${req.params.id}.png`), req.file.buffer)
    } catch (error) {
        next(error)
    }
    res.status(201).send("OK")
})

router.put("/:id", (req, res, next) => {
    const portfolios = getPortfolios()
    if (portfolios.length > 0) {
        const filteredPortfolios = portfolios.filter(portfolio => portfolio.id !== req.params.id)
        const portfolio = { id: req.params.id, ...req.body }

        filteredPortfolios.push(portfolio)

        fs.writeFileSync(portfoliosFilePath, JSON.stringify(filteredPortfolios))
        res.send(portfolio)
    } else {
        const error = new Error()
        error.httpStatusCode = 404
        error.message = "We dont have any data!"
        next(error)
    }
})

router.delete("/:id", (req, res, next) => {
    const portfolios = getPortfolios()
    if (portfolios.length > 0) {
        const filteredPortfolios = portfolios.filter(portfolio => portfolio.id !== req.params.id)
        const projectThatWillBeDeleted = portfolios.filter(portfolio => portfolio.id === req.params.id)
        if (projectThatWillBeDeleted.length > 0) {
            fs.writeFileSync(portfoliosFilePath, JSON.stringify(filteredPortfolios))

            const filteredStudents = students.filter(student => student.id !== projectThatWillBeDeleted[0].studentId)
            const decsStudentProjectNr = students.filter(student => student.id === projectThatWillBeDeleted[0].studentId)
            if (decsStudentProjectNr[0].numberOfProjects > 0) {
                decsStudentProjectNr[0].numberOfProjects--
            }

            filteredStudents.push(decsStudentProjectNr[0])

            fs.writeFileSync(studentsFilePath, JSON.stringify(filteredStudents))

            res.send("That project was deleted!")
        } else {
            const error = new Error()
            error.httpStatusCode = 404
            error.message = "We cannot find a project with this ID"
            next(error)

        }
    } else {
        const error = new Error()
        error.httpStatusCode = 404
        error.message = "We dont have any data!"
        next(error)
    }
})

module.exports = router