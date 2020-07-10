const express = require("express")
const fs = require("fs-extra")
const path = require("path")
const uniqid = require("uniqid")
const multer = require("multer")
const { xml2js } = require("xml-js")
const { begin } = require("xmlbuilder")
const axios = require("axios")
const PdfPrinter = require('pdfmake')
const pump = require("pump")
const { Transform } = require("json2csv")
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const q2m = require("query-to-mongo")


const router = express.Router()
const upload = multer()
const port = process.env.PORT || 3003

const ReviewsModel = require("../reviews/schema")
const ProductModel = require("./schema")
const { find } = require("./schema")
const ReviewModel = require("../reviews/schema")

const imagePath = path.join(__dirname, "../../public/img/products")
const pdfSaverPath = path.join(__dirname, "../../public/pdf")


const getProductPrice = async (id) => {
    const product = await ProductModel.findById(id)
    if (product) {
        return {
            price: parseInt(product.price),
            name: product.name
        }
    } else {
        const err = new Error()
        err.message = "No product with that ID"
        console.log(err)
    }
}
router.get("/", async (req, res, next) => {
    try {
        if (req.query) {
            const query = q2m(req.query)
            if (query.criteria.category.length === undefined
                ||
                query.criteria.category.length === 0
            ) {
                const count = await ProductModel.countDocuments()
                const products = await ProductModel
                    .find(query.criteria)
                    .sort(query.options.sort)
                    .limit(query.options.limit)
                    .skip(query.options.skip)
                    .populate("reviews")

                res.status(200).send({
                    products,
                    nrOfProducts: count

                })
            } else {
                const count = await ProductModel.countDocuments(query.criteria)
                const products = await ProductModel
                    .find(query.criteria)
                    .sort(query.options.sort)
                    .limit(query.options.limit)
                    .skip(query.options.skip)
                    .populate("reviews")

                res.status(200).send({
                    products,
                    nrOfProducts: count

                })
            }

        } else {
            const count = await ProductModel.countDocuments()
            const products = await ProductModel.find({})
            res.status(200).send({
                products,
                nrOfProducts: count

            })
        }
    } catch (error) {
        next(error)
    }
})
router.get("/:id", async (req, res, next) => {
    try {
        const product = await ProductModel.findById(req.params.id).populate("reviews")
        if (product) {
            res.status(200).send(product)
        }
    } catch (error) {
        next(error)
    }

})

router.post("/", async (req, res, next) => {
    try {
        const newProduct = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const addProduct = new ProductModel(newProduct)
        const { _id } = await addProduct.save()

        res.status(201).send(_id)

    } catch (error) {
        next(error)
    }
})
router.post("/:id/upload", upload.single("product"), async (req, res, next) => {
    try {
        if (req.file) {
            await fs.writeFile(path.join(imagePath, `${req.params.id}.png`), req.file.buffer)

            const product = await ProductModel.findByIdAndUpdate(
                req.params.id,
                {
                    imageUrl: `http://127.0.0.1:3005/img/products/${req.params.id}.png`
                }
            )
            res.status(200).send("Done")

        } else {
            const err = new Error()
            err.httpStatusCode = 400
            err.message = "Image file missing!"
            next(err)
        }

    } catch (error) {
        next(error)
    }

})
router.put("/:id", async (req, res, next) => {
    try {
        const findProduct = await ProductModel.findById(req.params.id)
        if (findProduct) {

            const updatedProduct = { ...req.body, updatedAt: new Date() }
            const addProduct = await ProductModel.findByIdAndUpdate(req.params.id, updatedProduct)
            const addedProduct = await ProductModel.findById(req.params.id)
            res.status(200).send(addedProduct)

        } else {
            const err = new Error()
            err.message = "We dont have products with that ID!"
            err.httpStatusCode = 404
            next(err)
        }

    } catch (error) {
        next(error)
    }

})
router.delete("/:id", async (req, res, next) => {
    try {
        const findProduct = await ProductModel.findById(req.params.id)
        if (findProduct) {

            await ProductModel.findByIdAndDelete(req.params.id)
            await ReviewModel.deleteMany(
                {
                    elementId: req.params.id
                }
            )
            res.status(200).send("Deleted")


        } else {
            const err = new Error()
            err.message = "We dont have products with that ID!"
            err.httpStatusCode = 404
            next(err)
        }

    } catch (error) {
        next(error)
    }

})
router.get("/calculate/sumTwoPrices", async (req, res, next) => {
    if (req.query && req.query.fpid && req.query.spid) {
        const product1 = await getProductPrice(req.query.fpid)
        const product2 = await getProductPrice(req.query.spid)
        try {
            const xml = begin({
                version: "1.0",
                encoding: "utf-8",
            })
                .ele('soap:Envelope',
                    {
                        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                        "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
                        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/"
                    })
                .ele("soap:Body")
                .ele("Add", { "xmlns": "http://tempuri.org/" })
                .ele("intA")
                .text(product1.price)
                .up()
                .ele("intB")
                .text(product2.price)
                .end()

            const response = await axios({
                method: "post",
                url: "http://www.dneonline.com/calculator.asmx?op=Add",
                data: xml,
                headers: { "Content-type": "text/xml" },
            })

            const xmlRespons = await response.data
            console.log(response)
            const result = xml2js(xmlRespons, { compact: true })
            const total = result["soap:Envelope"]["soap:Body"].AddResponse.AddResult._text
            res.status(200).send(`You selected two products 
            
                ${product1.name} => ${product1.price} $
                ${product2.name} => ${product2.price} $
            
            with a total cost: ${total} $`)

        } catch (error) {
            next(error)
        }
    }

})
router.get("/:id/exportToPDF", async (req, res, next) => {
    try {
        const findProduct = await ProductModel.findById(req.params.id)
        if (findProduct) {
            var fonts = {
                Roboto: {
                    normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
                    bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
                    italics: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
                    bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf'
                }
            };
            var printer = new PdfPrinter(fonts);
            var docDefinition = {
                pageMargins: [150, 50, 150, 50],
                content: [
                    { text: 'Product Info', fontSize: 25, background: 'yellow', italics: true },

                    "                                                                         ",
                    `             Name: ${findProduct.name}`,
                    `             Brand: ${findProduct.brand}`,
                    `             Description: ${findProduct.description}`,
                    `             Price: ${findProduct.price} $`,
                    `             Category: ${findProduct.category}`,
                ]
            }
            console.log(docDefinition)

            var pdfDoc = printer.createPdfKitDocument(docDefinition);
            res.setHeader("Content-Disposition", `attachment; filename=${findProduct._id}.pdf`)
            //saves file to the disk
            // pdfDoc.pipe(fs.createWriteStream(path.join(pdfSaverPath, `${findProduct._id}.pdf`)))
            //sends file to user
            pdfDoc.pipe(res)
            pdfDoc.end()

        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }


    } catch (error) {
        next(error)
    }
})
router.get("/convert/exportToCSV", async (req, res, next) => {
    const products = await getProducts()
    if (products.length > 0) {
        try {
            const fields = [
                "id",
                "name",
                "brand",
                "description",
                "price",
                "imageUrl",
                "category",
                "createdAt",
                "updatedAt"
            ]
            const opts = { fields }
            const input = fs.createReadStream(productsPath, { encoding: 'utf8' })
            const json2csv = new Transform(opts)

            res.setHeader("Content-Disposition", "attachment; filename=products.csv")
            pump(input, json2csv, res)

        } catch (error) {

        }
    } else {
        const err = new Error()
        err.httpStatusCode = 404
        next(err)
    }
})


module.exports = router