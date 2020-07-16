const express = require("express")
const Book = require("../../models/book")
const { Op, QueryTypes, Sequelize } = require("sequelize")
const sequelize = require("../../db")
const Review = require("../../models/review")

// [Op.and]: [{ a: 5 }, { b: 6 }],            // (a = 5) AND (b = 6)
// [Op.or]: [{ a: 5 }, { b: 6 }],             // (a = 5) OR (b = 6)
// someAttribute: {
//   // Basics
//   [Op.eq]: 3,                              // = 3
//   [Op.ne]: 20,                             // != 20
//   [Op.is]: null,                           // IS NULL
//   [Op.not]: true,                          // IS NOT TRUE
//   [Op.or]: [5, 6],                         // (someAttribute = 5) OR (someAttribute = 6)

//   // Using dialect specific column identifiers (PG in the following example):
//   [Op.col]: 'user.organization_id',        // = "user"."organization_id"

//   // Number comparisons
//   [Op.gt]: 6,                              // > 6
//   [Op.gte]: 6,                             // >= 6
//   [Op.lt]: 10,                             // < 10
//   [Op.lte]: 10,                            // <= 10
//   [Op.between]: [6, 10],                   // BETWEEN 6 AND 10
//   [Op.notBetween]: [11, 15],               // NOT BETWEEN 11 AND 15

//   // Other operators

//   [Op.all]: sequelize.literal('SELECT 1'), // > ALL (SELECT 1)

//   [Op.in]: [1, 2],                         // IN [1, 2]
//   [Op.notIn]: [1, 2],                      // NOT IN [1, 2]

//   [Op.like]: '%hat',                       // LIKE '%hat'
//   [Op.notLike]: '%hat',                    // NOT LIKE '%hat'
//   [Op.startsWith]: 'hat',                  // LIKE 'hat%'
//   [Op.endsWith]: 'hat',                    // LIKE '%hat'
//   [Op.substring]: 'hat',                   // LIKE '%hat%'
//   [Op.iLike]: '%hat',                      // ILIKE '%hat' (case insensitive) (PG only)
//   [Op.notILike]: '%hat',                   // NOT ILIKE '%hat'  (PG only)
//   [Op.regexp]: '^[h|a|t]',                 // REGEXP/~ '^[h|a|t]' (MySQL/PG only)
//   [Op.notRegexp]: '^[h|a|t]',              // NOT REGEXP/!~ '^[h|a|t]' (MySQL/PG only)
//   [Op.iRegexp]: '^[h|a|t]',                // ~* '^[h|a|t]' (PG only)
//   [Op.notIRegexp]: '^[h|a|t]',             // !~* '^[h|a|t]' (PG only)

//   [Op.any]: [2, 3],                        // ANY ARRAY[2, 3]::INTEGER (PG only)

//   // In Postgres, Op.like/Op.iLike/Op.notLike can be combined to Op.any:
//   [Op.like]: { [Op.any]: ['cat', 'hat'] }  // LIKE ANY ARRAY['cat', 'hat']

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit || 10
        const offset = req.query.offset || 0
        const order = req.query.order || "asc"

        delete req.query.limit
        delete req.query.offset
        delete req.query.order

        const books = await Book.findAll({
            where: {
                ...req.query
            },
            offset: offset,
            limit: limit,
            order: [
                ["title", order]
            ],
            include: Review   
        })
        res.send(books)
    }
    catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get("/search", async (req, res) => {
    try {
        //sequelize.query(`SELECT * FROM "Books"`, QueryTypes.SELECT)
        const result = await Book.findAll({
            where: {
                [Op.or]: [
                        {
                            title: {
                                [Op.iLike]: `%${req.query.title}%`
                            }
                        },
                        {
                            category: {
                                [Op.iLike]: `%${req.query.title}%`
                            }
                        }
                ]
            }
        })

        res.send(result)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})


router.get("/:asin", async (req, res) => {
    try {
        const book = await Book.findOne({
            where: {
                asin: req.params.asin
            },
            include: Review
        })

        if (book)
            res.send(book)
        else
            res.status(404).send("Not found")

    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})



router.post("/", async (req, res) => {
    try {
        const book = await Book.create(req.body)
        res.send(book)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.put("/:asin", async (req, res) => {
    try {
        const book = await Book.update({
            ...req.body
        }, {
            where: { asin: req.params.asin }
        })

        if (book[0] === 1)
            res.send("OK")
        else
            res.status(404).send("Not found")

    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.delete("/:asin", async (req, res) => {
    try {
        const result = await Book.destroy({
            where: {
                asin: req.params.asin
            }
        })

        if (result === 1)
            res.send("DELETED")
        else
            res.status(404).send("Not Found")

    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router;