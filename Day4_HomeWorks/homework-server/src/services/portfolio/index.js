const express = require("express")
const fs = require("fs-extra")
const path = require("path")
const uniqid = require("uniqid")
const multer = require("multer")
const ProjectSchema = require("./schema")
const { find } = require("./schema")
const StudentModel = require("../students/schema")
const q2m = require("query-to-mongo")

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
        const query = q2m(req.query)
        const projects = await ProjectSchema.find({ name: new RegExp(query.criteria.name, 'i') })
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

router.get("/:id", async (req, res, next) => {
    try {
        const project = await ProjectSchema.findById(req.params.id)
        if (project) {
            res.status(200).send(project)
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

router.get("/:id/getPhoto", (req, res, next) => {
    try {
        if (fs.existsSync(path.join(projectsImagePath, `${req.params.id}.png`))) {
            const source = fs.createReadStream(path.join(projectsImagePath, `${req.params.id}.png`))
            source.pipe(res)
        } else {
            const error = new Error()
            error.httpStatusCode = 404
            error.message = "We dont have any image for this project!"
            next(error)
        }

    } catch (error) {
        next(error)
    }

})

router.get("/:id/download", (req, res, next) => {
    console.log()
    if (fs.existsSync(path.join(projectsImagePath, `${req.params.id}.png`))) {
        const source = fs.createReadStream(path.join(projectsImagePath, `${req.params.id}.png`))
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${req.params.id}.png`
        )
        source.pipe(res)
    } else {
        const error = new Error()
        error.httpStatusCode = 404
        error.message = "We dont have any image for this project!"
        next(error)
    }
})

router.post("/", async (req, res, next) => {

    try {
        const newProject = await ProjectSchema({ ...req.body, createdAt: new Date() })
        const resp = await newProject.save()
        await StudentModel.increaseTheNOP(req.body.studentId)
        res.status(201).send(newProject)
    } catch (error) {
        next(error)
    }

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
        if (req.file) {
            await fs.writeFile(path.join(projectsImagePath, `${req.params.id}.png`), req.file.buffer)
            res.status(201).send("OK")
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            err.message = "Not found"
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        const updatedProject = req.body
        const project = await ProjectSchema.findByIdAndUpdate(req.params.id, updatedProject)
        res.status(200).send("Updated")
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const find = await ProjectSchema.findById(req.params.id)
        if (find) {
            await StudentModel.decreaseTheNOP(find.studentId)
            await ProjectSchema.findByIdAndDelete(req.params.id)
            res.status(200).send(find.studentId)
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            err.message = "Not found"
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router