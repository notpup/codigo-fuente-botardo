import { ActivityType, Client } from "discord.js"
import { AudioPlayer, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioResource } from "@discordjs/voice"
import "dotenv/config"

import path from "path"

import { CreateVoice, GetVoice, GetAllVoices } from "./src/modules/VoiceClient.js"

import * as url from 'url';
import { createReadStream } from "fs"
import { GetCounts } from "./src/modules/Functions.js"

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const client = new Client({
	intents: [
		3276799
	]
})

client.on("ready", () => {
	console.log("Bot en linea broder")
	const func = () => {
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
	}
	setInterval(func, 30*1000) // Update cada 30s
	func()
})

client.on("messageCreate", (message) => {
	try {
		const vc = message.member.voice.channel
		const msg = message.content

		if (msg.substring(0, 1) == "'" && vc && vc.joinable && message.member.user.bot == false) {
			let messageContent = msg.substring(2)
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
					messageContent = split.join(" ")
				}

				if (messageContent.length == 0) return

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
					resource.volume.setVolume(2)

					connection.subscribe(player)
					player.play(resource)
				})
				.catch(err => {
					message.reply("Error al procesar la solicitud en AWS")
				})

				if (messageContent.toLowerCase() == "pene"){
					message.reply("comes")
				}
			}
		} else {
		}
	} catch (err) {
		console.log("Hubo un error en la deteccion de mensaje")
		console.log(err)
	}

})

client.login(process.env.DISCORD_LOGINTOKEN)

export default client