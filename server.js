import express from "express"
import "dotenv/config"
import discordclient from "./client.js"

const app = express()

app.get("/", (req, res, next) => {
	return res.status(200).json({
		success: true
	})
})

app.listen(process.env.PORT,"0.0.0.0", () => {
	console.log("Escuchando")
})