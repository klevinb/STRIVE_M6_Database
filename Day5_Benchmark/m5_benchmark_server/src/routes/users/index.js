const express = require("express")
const UserModel = require("./schema")

const router = express.Router()


router.get("/:id", async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id)
        res.status(200).send(user)
    } catch (error) {
        next(error)
    }
})

router.post("/", async (req, res, next) => {
    try {
        newUser = req.body
        const addUser = new UserModel(newUser)
        const { _id } = await addUser.save()

        res.status(201).send(_id)

    } catch (error) {
        next(error)
    }
})

router.post("/:id/add-product-to-cart/:productId", async (req, res, next) => {
    try {
        const newProduct = { ...req.body, quantity: 1 }
        const product = await UserModel.findProductInCart(req.params.id, req.params.productId)
        if (product) {
            await UserModel.incrementCartQuantity(
                req.params.id,
                req.params.productId,
                1
            )
            res.send("Quantity incremented")
        } else {

            await UserModel.addProductToCart(req.params.id, newProduct)
            res.status(200).send("Product added")

        }
    } catch (error) {
        next(error)
    }

})

router.get("/:id/calculateTotal", async (req, res, next) => {
    try {
        const total = await UserModel.calculateCartTotal(req.params.id)
        res.send({ total })
    } catch (error) {
        next(error)
    }
})


module.exports = router