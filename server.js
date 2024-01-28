import express from "express"
import "dotenv/config"
import discordclient from "./client.js"

const app = express()

app.listen(process.env.PORT,"0.0.0.0", () => {
	console.log("Escuchando")
})