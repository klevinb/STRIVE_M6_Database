const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")
const sequelize = require("./db")
const bookRouter = require("./routes/books")
const reviewRouter = require("./routes/reviews")
const cartRouter = require("./routes/cart")

sequelize.authenticate()
         .then(() => console.log("It's working"))
         .catch((e) => console.log(e))

const server = express()
server.use(cors())
server.use(express.json())

server.use("/books", bookRouter)
server.use("/reviews", reviewRouter)
server.use("/cart", cartRouter)

server.listen(process.env.PORT || 4000, () => console.log(process.env.PORT || 4000))