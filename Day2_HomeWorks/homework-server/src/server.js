const express = require("express")
const listEndpoints = require("express-list-endpoints")
const studentRoute = require("./services/students")
const portfoliosRoute = require("./services/portfolio")
const mongoose = require("mongoose")
const {
    notFound,
    notAuthorized,
    generalError
} = require("./handleErrors")

const cors = require("cors")


const server = express()

server.use(cors())
server.use(express.json())

const port = process.env.PORT || 3003

server.use("/students", studentRoute)
server.use("/projects", portfoliosRoute)

console.log(listEndpoints(server))

server.use(notFound)
server.use(notAuthorized)
server.use(generalError)

mongoose
    .connect("mongodb://localhost:27017/Day2_HomeWorks", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(
        server.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    )
    .catch((err) => console.log(err))
