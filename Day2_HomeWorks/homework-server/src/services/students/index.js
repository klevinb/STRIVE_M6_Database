const express = require("express")
const fs = require("fs-extra")
const path = require("path")
const uniqid = require("uniqid")
const multer = require("multer")
const portfolios = require("../portfolio/portfolios.json")
const StudentSchema = require("./schema")
const { find } = require("./schema")

const router = express.Router()

const upload = multer()

const usersImagePath = path.join(__dirname, "../../public/img/users")

router.get("/", async (req, res, next) => {
    try {
        const students = await StudentSchema.find(req.query)
        if (students) {
            res.send(students)
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

router.get("/:id/projects", (req, res) => {
    const studentProjects = portfolios.filter(project => project.studentId === req.params.id)

    res.send(studentProjects)
})

router.get("/:id", async (req, res, next) => {
    try {
        const student = await StudentSchema.findById(req.params.id)
        if (student) {
            res.status(200).send(student)
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

router.get("/:id/getPhoto", (req, res) => {
    const source = fs.createReadStream(path.join(usersImagePath, `${req.params.id}.png`))
    source.pipe(res)
})
router.get("/:id/download", (req, res) => {
    const source = fs.createReadStream(path.join(usersImagePath, `${req.params.id}.png`))
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${req.params.id}.png`
    )
    source.pipe(res)
})

router.post("/", async (req, res) => {
    try {
        const newStudent = new StudentSchema(req.body)
        const { _id } = await newStudent.save()
        res.status(201).send("Created")
    } catch (error) {
        next(error)
    }

})

router.post("/:id/uploadPhoto", upload.single("profile"), async (req, res, next) => {
    try {
        await fs.writeFile(path.join(usersImagePath, `${req.params.id}.png`), req.file.buffer)
    } catch (error) {
        next(error)
    }
    res.status(201).send("OK")
})

router.post("/checkEmail", async (req, res, next) => {
    try {
        const checkEmail = req.body.email
        const findEmail = await StudentSchema.find({
            $and: [
                { "email": checkEmail },
                { "_id": { $ne: req.body._id } }
            ]
        })
        if (findEmail.length > 0) {
            res.status(400).send(false)
        } else {
            res.status(200).send(true)
        }
    } catch (error) {
        next(error)
    }

})

router.put("/:id", async (req, res, next) => {
    try {
        const updatedStudent = await StudentSchema.findByIdAndUpdate(req.params.id, req.body)
        if (updatedStudent) {
            res.status(200).send("Updated")
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

router.delete("/:id", async (req, res, next) => {
    try {
        const students = await StudentSchema.findByIdAndDelete(req.params.id)
        if (students) {
            res.status(200).send("Deleted!")
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

module.exports = router