const express = require("express")
const productsRoutes = require("./routes/products")
const reviewsRoutes = require("./routes/reviews")
const usersRoutes = require("./routes/users")
const listEndpoints = require("express-list-endpoints")
const { notFound, badRequest, generalError, checkReviewError } = require('./errorHandlers')
const { join } = require("path")
const cors = require("cors")
const mongoose = require("mongoose")

const server = express()

const publicFolderPath = join(__dirname, "./public")

server.use(cors())
server.use(express.json())
server.use(express.static(publicFolderPath))
const port = process.env.PORT || 3005

// Routes
server.use("/products", productsRoutes)
server.use("/reviews", reviewsRoutes)
server.use("/users", usersRoutes)
console.log(listEndpoints(server))
server.use(checkReviewError)

server.use(notFound)
server.use(badRequest)
server.use(generalError)

mongoose
    .connect("mongodb://localhost:27017/benchmark", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(
        server.listen(port, () => {
            console.log(`Server is running on PORT:${port}`)
        })
    ).catch(err => console.log(err))
