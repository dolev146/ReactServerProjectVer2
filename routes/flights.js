const router = require("express").Router()
const { verifyAdmin, verifyUser } = require("../verify")
const { deleteOrdersConnected } = require("./deleteOrdersConnected")
const Query = require("../db")



// get all flights - all
router.get("/", async (req, res) => {
    try {
        let q = `SELECT * FROM flights `
        let flights = await Query(q)
        res.json(flights)
    } catch (error) {
        res.sendStatus(500)
    }
})

// get filtered flights - all
router.get("/regular/:id", verifyUser, async (req, res) => {
    try {
        let q = `SELECT flights.id as id , flights.descrip as descrip  , flights.dest as dest , flights.picture as picture , flights.dept as dept ,
        flights.arv as arv , flights.price as price , orders.user_id as follower_id  FROM flights 
        LEFT JOIN orders ON orders.flight_id = flights.id where orders.user_id = ? group by orders.flight_id order by orders.flight_id`
        let Followed_vacations = await Query(q, [req.params.id])

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
})

router.get("/followed/:id", verifyUser, async (req, res) => {
    try {
        let q = `SELECT flights.id as id , flights.descrip as descrip  , flights.dest as dest , flights.picture as picture , flights.dept as dept ,
        flights.arv as arv , flights.price as price , orders.user_id as follower_id  FROM flights 
        LEFT JOIN orders ON orders.flight_id = flights.id where orders.user_id = ? group by orders.flight_id order by orders.flight_id`
        let Followed_vacations = await Query(q, [req.params.id])
        if (Followed_vacations.length) {
            res.json(Followed_vacations)
        } else {
            res.json({ error: true, msg: "no followed vacations" })
        }
    } catch (error) {
        res.sendStatus(500)
    }
})

router.get("/:id", async (req, res) => {
    try {
        let q = `SELECT * FROM flights WHERE id = ?`
        let flight = await Query(q, [req.params.id])
        res.json(flight)
    } catch (err) {
        res.sendStatus(500)
    }
})

// add flight - admin 
router.post("/add", verifyAdmin, async (req, res) => {
    const { descrip, dest, picture, dept, arv, price } = req.body
    if (descrip && dest && picture && dept && arv && price) {
        let q = `INSERT INTO flights(descrip, dest, picture, dept, arv, price)
        VALUES (?, ?, ?, ?, ?, ?)`
        try {
            let result = await Query(q, [descrip, dest, picture, dept, arv, price])
            let flights = await Query(`SELECT * FROM flights`)
            res.json(flights)
        } catch (error) {
            res.sendStatus(500)
        }
    } else {
        res.status(400).json({ err: true, msg: "missing some info" })
    }
})

// delete flight - admin 
router.delete("/:id", verifyAdmin, deleteOrdersConnected, async (req, res) => {
    try {
        let q = `DELETE FROM flights WHERE id = ?`
        let results = await Query(q, [req.params.id])
        let flights = await Query(`SELECT * FROM flights`)
        res.json(flights)
    } catch (error) {
        res.sendStatus(500)
    }

})

// edit flight - admin 
router.put("/:id", verifyAdmin, async (req, res) => {
    const { descrip, dest, dept, arv, price } = req.body
    try {
        let q = `UPDATE flights SET descrip = ?, dest = ?, dept = ?, arv = ?, price = ? 
        WHERE id = ?`
        let results = await Query(q, [descrip, dest, dept, arv, price, req.params.id])
        let flights = await Query(`SELECT * FROM flights`)
        res.json(flights)
    } catch (error) {
        res.sendStatus(500)
    }
})






module.exports = router