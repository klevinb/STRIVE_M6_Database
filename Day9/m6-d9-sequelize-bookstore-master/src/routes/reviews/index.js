const express = require("express")
const Review = require("../../models/review")

const router = express.Router()

router.get("/:asin", async (req, res)=>{
    try{
        res.send(await Review.findAll({
            where: {
                bookid: req.params.asin
            }
        }))
    }
    catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.post("/:asin", async (req,res)=>{
    try{
        res.send(await Review.create({
            ...req.body,
            bookid: req.params.asin
        }))
    }
    catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.put("/:reviewId", async (req, res)=>{
    try{
        delete req.body.bookid // we don't want to update the bookid field. Once a review is created, it should be fixed on one book
        delete req.body.userid // we don't want to update the userid field. Once a reviewer wrote a review, that review is fixed to him

        const result = await Review.update({ //update the review
            ...req.body  // <= all the fields included in the req.body
        }, {
            where: { // for the element with id = req.params.reviewId
                id: req.params.reviewId
            }
        })

        if (result[0] === 1) // if we updated something
            res.send("OK") // we return OK 
        else 
            res.status(404).send("Not found") // probably the ID was not there, NOT FOUND
    }
    catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.delete("/:reviewId", async (req, res)=>{
    try{
        res.send(await Review.destroy({
            where: { id: req.params.reviewId }
        }))
    }
    catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router