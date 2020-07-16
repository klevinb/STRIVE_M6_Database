
const notFound = (err, req, res, next) => {
    if (err.httpStatusCode === 404) {
        res.status(404).send(err.message)
    }
    next(err)
}

const notAuthorized = (err, req, res, next) => {
    if (err.httpStatusCode === 401) {
        res.status(401).send(err.message)
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
    notAuthorized,
    generalError
}