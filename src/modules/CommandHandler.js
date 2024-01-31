import { ApplicationCommandOptionType, REST, Routes } from "discord.js"
import { GetAllVoices, Voices } from "./VoiceClient.js"
import users from "../models/user.model.js"

import "dotenv/config"

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_LOGINTOKEN)

const CreateVoicesChoices = () => {
	let arr = []
	let inarray = 0
	GetAllVoices().forEach(e => {
		if (inarray >= 25) return
		inarray++
		arr.push({
			name: e.Name,
			value: e.Id
		})
	})
	//arr = arr.slice(arr.length - 3)
	//console.log(arr)
	return arr
}

const GetSlashCommands = () => {
	return [
		{
			name: "tts",
			description: "Reproduce texto a voz con el bot",
			options: [
				{
					name: "texto",
					description: "Texto a escuchar",
					type: ApplicationCommandOptionType.String,
					required: true
				},
				{
					name: "voz",
					description: "Nombre de la voz a elegir",
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			]
		},
		{
			name: "myvoice",
			description: "Establece tu voz al momento de hablar",
			options: [
				{
					name: "voz",
					description: "Nombre de la voz a elegir",
					type: ApplicationCommandOptionType.String,
					required: true,
				}
			]
		},
		{
			name: "default",
			description: "Establece la voz por defecto para el servidor",
			options: [
				{
					name: "voz",
					description: "Nombre de la voz a elegir",
					type: ApplicationCommandOptionType.String,
					required: true,
				}
			]
		}
	]
}

const wait = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms))
}

const CommandsInit = async (client) => {
	/*
	while (true) {
		console.log("Esperando voices")
		await wait(1000)
		if (GetAllVoices().length > 0) {
			break
		}
	}
	console.log("CARGADO")*/
	try {
		console.log("Registrando slash commands")
		await rest.put(
			Routes.applicationCommands(process.env.DISCORD_BOTID),
			{ body: GetSlashCommands() }
		)
		console.log("Slash commands registrados")
		client.on("interactionCreate", async (interaction) => {
			if (!interaction.isChatInputCommand()) return

			const userid = interaction.user.id
			if (interaction.commandName == "myvoice") {
				const voice = interaction.options.get("voz")
				const finded = GetAllVoices().find(e => {
					if (e.Name.toLowerCase() === voice.value.toLowerCase() || e.Id.toLowerCase() === voice.value.toLowerCase()) return true
				})

				if (!finded) {
					return interaction.reply("Voz no encontrada, podes ver la lista de voces usando el comando /voices")
				}

				let data = await users.findOne({ userid })
				if (data == null) {
					data = await users.create({
						userid,
						voice: finded.Id
					})
				} else {
					data.voice = finded.Id
					await data.save()
				}
				
				interaction.reply(`Tu voz por defecto ahora es **${finded.Id}**`)
			} else if (interaction.commandName == "tts" || interaction.commandName == "speak") {
				let text = interaction.options.get("text")
				let voice = interaction.options.get("voice")

				text.value = text.value.trim()

				if (voice && voice.value) {
					const finded = GetAllVoices().find(e => {
						if (e.Name.toLowerCase() === voice.value.toLowerCase() || e.Id.toLowerCase() === voice.value.toLowerCase()) return true
					})
					if (finded) {
						voice = finded.Id
					} else {
						users.findOne({userid})
					}
				}
			}
		})

	} catch (err) {
		console.log("Ocurrio un error al cargar los comandos /")
		console.log(err)
	}
}

export default CommandsInit