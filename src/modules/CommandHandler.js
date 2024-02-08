import { ApplicationCommandOptionType, REST, Routes, EmbedBuilder } from "discord.js"

import "dotenv/config"





import { GetAllVoices, Voices } from "./VoiceClient.js"
import { GetExactVoiceName, VoiceManager } from "./Functions.js"

import users from "../models/user.model.js"
import servers from "../models/server.model.js"

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
			name: "speak",
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
		},
		{
			name: "voices",
			description: "Devuelve la lista de voces",
			options: [
				{
					name: "pagina",
					description: "Numero de pagina de voces",
					type: ApplicationCommandOptionType.Number,
					required: true,
				}
			]
		},
		{
			name: "customvoices",
			description: "Devuelve la lista de voces custom",
			options: [
				{
					name: "pagina",
					description: "Numero de pagina de voces",
					type: ApplicationCommandOptionType.Number,
					required: true,
				}
			]
		},
		{
			name: "invite",
			description: "Devuelve el link de invitacion",
		},
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

				let userdata = await users.findOne({ userid })
				let serverData = await servers.findOne({ guildid: interaction.guildId })

				if (userdata == null) {
					userdata = await users.create({
						userid,
					})
				}
				if (serverData == null) {
					serverData = await servers.create({
						guildid: interaction.guildId,
					})
				}

				const exactVoice = GetExactVoiceName(voice.value, (userdata.premium === true || serverData.premium === true))
				if (!exactVoice) {
					if (String(voice.value).toLowerCase() === "custom") {
						return interaction.reply("No tenes permiso para usar esa voz!")
					} else {
						return interaction.reply("Voz no encontrada, podes ver la lista de voces usando el comando /voices")
					}
					
				}

				userdata.voice = exactVoice.Id
				await userdata.save()

				interaction.reply(`Tu voz por defecto ahora es **${exactVoice.Id}**`)
			} else if (interaction.commandName == "invite") {
				interaction.reply({ content: `Enlace de invitacion:\n${process.env.INVITELINK}`, ephemeral: true })
			} else if (interaction.commandName == "voices") {
				let pagina = interaction.options.get("pagina")
				const page = pagina.value || 1

				const voicesEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle(`Lista de voces no-premium: (Pagina ${page})`)
				

				GetAllVoices().slice(page*25, (page+1)*25).forEach(e => {
					voicesEmbed.addFields({
						name: e.Id, value: e.LanguageName, inline: true
					})
				})
				console.log(voicesEmbed)
				interaction.reply({ embeds: [ voicesEmbed ] })

			} else if (interaction.commandName == "tts" || interaction.commandName == "speak") {
				let text = interaction.options.get("texto")
				let voice = interaction.options.get("voz")

				const response = await VoiceManager({
					userid: userid,
					voice: voice ? voice.value.trim() : null,
					text: text.value.trim(),
					voiceChannelId: interaction.member.voice.channelId,
					guildId: interaction.guildId
				})

				if (response.success) {
					interaction.reply(response.message)
				} else {
					interaction.reply(response.message)
				}
			}
		})

	} catch (err) {
		console.log("Ocurrio un error al cargar los comandos /")
		console.log(err)
	}
}

export default CommandsInit