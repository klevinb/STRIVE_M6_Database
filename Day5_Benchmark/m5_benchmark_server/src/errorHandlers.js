const notFound = (err, req, res, next) => {
    if (err.httpStatusCode === 404) {
        res.status(404).send(err.message)
    }
    next(err)
}
const badRequest = (err, req, res, next) => {
    if (err.httpStatusCode === 400) {
        res.status(400).send(err.message)
    }
    next(err)
}
const checkReviewError = (err, req, res, next) => {
    if (err.httpStatusCode === 444) {
        res.status(444).send(err.message)
    }
    next(err)
}

const generalError = (err, req, res, next) => {
    if (!res.headersSent) {
        res.status(err.httpStatusCode || 500).send(err.message)
    }
}

module.exports = {
    notFound,
    generalError,
    badRequest,
    checkReviewError
}