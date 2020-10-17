const Query = require("../db")
const deleteOrdersConnected = async (req, res, next) => {
    try {
        let q = `delete
        FROM orders
        WHERE flight_id = ?`
        let results = await Query(q, [req.params.id])
        next()
    } catch (error) {
        res.sendStatus(500)
    }
}

module.exports = {
    deleteOrdersConnected
}