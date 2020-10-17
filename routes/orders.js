let router = require("express").Router()
const { verifyUser, verifyAdmin } = require("../verify")
const Query = require("../db")


// place order
router.post("/", verifyUser, async (req, res) => {
    console.log("follow")
    try {
        const { userId, flightId } = req.body
        if (userId && flightId) {
            // placing the order
            let q = `INSERT INTO orders (user_id , flight_id)
                        VALUES(? , ?)`
            await Query(q, [userId, flightId])

            // giving back filtered orders
            q = `SELECT flights.id as id , flights.descrip as descrip  , flights.dest as dest , flights.picture as picture , flights.dept as dept ,
                flights.arv as arv , flights.price as price , orders.user_id as follower_id  FROM flights 
                LEFT JOIN orders ON orders.flight_id = flights.id where orders.user_id = ? group by orders.flight_id order by orders.flight_id`
            let Followed_vacations = await Query(q, [userId])

            // declare so i can use in this scope
            let Unfollowed_vacations;

            if (!Followed_vacations.length) {
                // give me all vacations
                q = ` SELECT flights.id as id , flights.descrip as descrip  , flights.dest as dest , flights.picture as picture , flights.dept as dept ,
                    flights.arv as arv , flights.price as price , orders.user_id as follower_id FROM flights 
                    LEFT JOIN orders ON orders.flight_id = flights.id group by flights.id order by orders.flight_id `
                Unfollowed_vacations = await Query(q)
                res.json(Unfollowed_vacations)
            }
            // else check what is happening in the flights i dont follow
            else {
                let FlightsNumberToNotFollow = Followed_vacations.map(v => v.id)
                q = ` SELECT flights.id as id , flights.descrip as descrip  , flights.dest as dest , flights.picture as picture , flights.dept as dept ,
                    flights.arv as arv , flights.price as price , orders.user_id as follower_id FROM flights 
                    LEFT JOIN orders ON orders.flight_id = flights.id where flights.id NOT IN (?) group by flights.id order by orders.flight_id `
                Unfollowed_vacations = await Query(q, [[...FlightsNumberToNotFollow]])
            }
            // check the image that describe the project to see the logic behind this call
            if (!Unfollowed_vacations.length) {
                res.json(Followed_vacations)
            }
            if (Unfollowed_vacations.length && Followed_vacations.length) {
                let all_vacations = [...Followed_vacations.concat(Unfollowed_vacations)]
                const compare = (a, b) => {
                    if (a.id > b.id) return 1;
                    if (b.id > a.id) return -1;
                    return 0;
                };
                let sortedArray = all_vacations.sort(compare)
                res.json(sortedArray)
            }
        } else {
            res.status(400).json({ error: true, msg: "missing some info Neshama" })
        }
    } catch (error) {
        res.sendStatus(500)
    }
})

// delete order
router.post("/delete", verifyUser, async (req, res) => {
    console.log("unfollow")
    const { userId, flightId } = req.body
    if (userId && flightId) {
        try {
            // deleting the order
            let q = `DELETE FROM orders 
            WHERE user_id = ?  AND flight_id = ?`
            await Query(q, [userId, flightId])

            // giving back filtered orders
            q = `SELECT flights.id as id , flights.descrip as descrip  , flights.dest as dest , flights.picture as picture , flights.dept as dept ,
            flights.arv as arv , flights.price as price , orders.user_id as follower_id  FROM flights 
            LEFT JOIN orders ON orders.flight_id = flights.id where orders.user_id = ? group by orders.flight_id order by orders.flight_id`
            let Followed_vacations = await Query(q, [userId])

            // declare so i can use in this scope
            let Unfollowed_vacations;

            if (!Followed_vacations.length) {
                // give me all vacations
                q = ` SELECT flights.id as id , flights.descrip as descrip  , flights.dest as dest , flights.picture as picture , flights.dept as dept ,
            flights.arv as arv , flights.price as price , orders.user_id as follower_id FROM flights 
             LEFT JOIN orders ON orders.flight_id = flights.id group by flights.id order by orders.flight_id `
                Unfollowed_vacations = await Query(q)
                res.json(Unfollowed_vacations)

            }
            // else check what is happening in the flights i dont follow
            else {
                let FlightsNumberToNotFollow = Followed_vacations.map(v => v.id)
                q = ` SELECT flights.id as id , flights.descrip as descrip  , flights.dest as dest , flights.picture as picture , flights.dept as dept ,
                flights.arv as arv , flights.price as price , orders.user_id as follower_id FROM flights 
                LEFT JOIN orders ON orders.flight_id = flights.id where flights.id NOT IN (?) group by flights.id order by orders.flight_id `
                Unfollowed_vacations = await Query(q, [[...FlightsNumberToNotFollow]])
            }
            // check the image that describe the project to see the logic behind this call
            if (!Unfollowed_vacations.length) {
                res.json(Followed_vacations)
            }
            if (Unfollowed_vacations.length && Followed_vacations.length) {
                let all_vacations = [...Followed_vacations.concat(Unfollowed_vacations)]
                const compare = (a, b) => {
                    if (a.id > b.id) return 1;
                    if (b.id > a.id) return -1;
                    return 0;
                };
                let sortedArray = all_vacations.sort(compare)
                res.json(sortedArray)
            }
        } catch (error) {
            res.sendStatus(500)
        }
    } else {
        res.status(400).json({ error: true, msg: "missing some info Neshama" })
    }
})

router.get("/", verifyAdmin, async (req, res) => {
    try {
        let q = `
        SELECT users.* , flights.* 
        FROM orders
        INNER JOIN users ON orders.user_id = users.id
        INNER JOIN flights ON orders.flight_id = flights.id
        `
        let orders = await Query(q)
        res.json(orders)
    } catch (err) {
        res.sendStatus(500)
    }
})

router.get("/:id", verifyUser, async (req, res) => {
    try {
        let q = `
        SELECT users.fname , users.lname , flights.descrip, flights.dest 
        FROM orders
        INNER JOIN users ON orders.user_id = users.id
        INNER JOIN flights ON orders.flight_id = flights.id
        WHERE orders.user_id = ?
        `
        let orders = await Query(q, [req.params.id])
        res.json(orders)
    } catch (err) {
        res.sendStatus(500)
    }
})

router.post("/reports",verifyAdmin, async (req, res) => {
    try {
        let q = `
        SELECT f.dest AS dest, COUNT(o.user_id) AS followers
        FROM orders AS o 
        JOIN flights AS f ON o.flight_id = f.id GROUP BY flight_id HAVING followers > 0
        `
        let ordersByFollowers = await Query(q)
        let a = JSON.stringify(ordersByFollowers)
        let b = JSON.parse(a)
        console.log(b)
        res.json(b)
    } catch (error) {
        res.sendStatus(500)
    }
})

module.exports = router