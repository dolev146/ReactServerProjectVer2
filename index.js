//imports
const express = require("express")
const cors = require("cors")
const db = require("./db")

const app = express()

// mw
app.use(express.json())
app.use(cors())
app.use("/users" ,require("./routes/users"))
app.use("/flights" ,require("./routes/flights"))
app.use("/orders" ,require("./routes/orders"))
app.use("/search" ,require("./routes/search"))
app.use("/public",express.static("public"))

app.get("/", (req, res) => {
    res.send("welcome to my api, get your API key from your system administrator")
})

// listiner
app.listen(1000, () => console.log("up and running on 1000"))


