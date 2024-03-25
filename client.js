import { ActivityType, Client, SlashCommandBuilder } from "discord.js"
import { AudioPlayer, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioResource, getVoiceConnection } from "@discordjs/voice"
import { connect } from "mongoose"
import path from "path"
import * as url from 'url';
import { createReadStream } from "fs"

import "dotenv/config"

import { CreateVoice, GetVoice, GetAllVoices } from "./src/modules/VoiceClient.js"
import { GetCounts, VoiceManager } from "./src/modules/Functions.js"
import CommandsInit from "./src/modules/CommandHandler.js"
import usersdata from "./src/models/user.model.js"

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const client = new Client({
	intents: [
		3276799
	]
})

client.on("ready", () => {
	console.log("Bot en linea broder")
	CommandsInit(client)
	const func = () => {
		try {
			const Counts = GetCounts(client)
			client.user.setPresence({
				activities: [
					{
						name: `${Counts.servers} servers w/ ${Counts.members} members`,
						type: ActivityType.Watching
					}
				],
				status: "dnd"
			})
		} catch(err) {
			console.log("Error en setPrecense:")
			console.log(err)
		}
		
	}
	setInterval(func, 30 * 1000) // Update cada 30s
	func()
})

client.on("messageCreate", async (message) => {
	try {
		if (message.member == null) return
		if (message.member.voice == null) return
		if (message.member.voice.channel == nill) return
		
		const vc = message.member.voice.channel
		const msg = message.content

		if (msg.substring(0, 1) == "'" && vc && vc.joinable && message.member.user.bot == false) {
			let messageContent = msg.substring(2).trim()
			const split = messageContent.split(" ")

			if (split[0] && split[0].toLowerCase() == "voices") { // Comando: "' voices"
				const Voices = GetAllVoices()
				let Text = ""

				Voices.forEach(e => {
					Text = Text + `${e.Id} (${e.LanguageCode})\n`
				})

				message.reply(Text)
			} else if (split[0]) {

				let UsedVoice = "Miguel" // Voz por defecto

				const Voice = GetVoice(split[0])
				if (Voice) {
					UsedVoice = Voice.Id
					split.shift()
					messageContent = split.join(" ").trim()
				} else {
					const finded = await usersdata.findOne({ userid: message.author.id })
					if (finded) {
						UsedVoice = finded.voice
					}
				}

				if (messageContent.length == 0) return

				if (messageContent.toLowerCase() == "pene") {
					message.reply("comes")
				}

				const response = await VoiceManager({
					userid: message.author.id,
					voice: Voice ? Voice.Id : null,
					text: messageContent,
					voiceChannelId: vc.id,
					guildId: message.guildId
				})
				/*
				const connection = joinVoiceChannel({
					channelId: vc.id,
					guildId: vc.guildId,
					adapterCreator: vc.guild.voiceAdapterCreator
				})

				const voiceBuffer = CreateVoice(messageContent, UsedVoice, `${message.guildId}`)
				voiceBuffer.then((FileName) => {
					const player = createAudioPlayer()
					const parte = path.join(__dirname, `/src/audio/${FileName}.mp3`)
					const resource = createAudioResource(parte, { inlineVolume: true })
					resource.volume.setVolume(1.5)

					connection.subscribe(player)
					player.play(resource)
				})
				.catch(err => {
					message.reply("Error al procesar la solicitud en AWS")
				})*/


			}
		} else {
		}
	} catch (err) {
		console.log("Hubo un error en la deteccion de mensaje")
		console.log(err)
	}
})

client.on("voiceStateUpdate", async (oldState, newState) => {
	try {
		if (oldState.channelId != newState.channelId) {
			//const disconnectionChannelId = oldState.channelId
			if (oldState.channel) {
				const botIsIn = oldState.channel.members.some(member => {
					if (member.user.id == client.user.id) return true
				})
				const hasUsers = oldState.channel.members.some(member => {
					if (!member.user.bot) return true
				})

				if (!hasUsers && botIsIn) {
					const connection = getVoiceConnection(oldState.guild.id)
					if (connection) {
						connection.destroy()
					}
				}
			}
		} else {

		}
	} catch (err) {
		console.log("Error detectado en 'voiceStateUpdate':")
		console.log(err)
	}

})

client.login(process.env.DISCORD_LOGINTOKEN)

connect(process.env.MONGOCONNECT_URI).then(() => {
	console.log("Database conectada")
})

export default client