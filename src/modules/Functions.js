import { AudioPlayer, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioResource } from "@discordjs/voice"

import client from "../../client.js"
import { GetAllVoices, CreateVoice } from "./VoiceClient.js"

import servers from "../models/server.model.js"
import users from "../models/user.model.js"

import fs from "fs"
import path from "path"
import * as url from "url"
import { warn } from "console"

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const UpdateActivity = (Client, ActivityText) => {
}

const GetCounts = (Client) => {
	let serversNumber = 0
	let membersNumber = 0
	Client.guilds.cache.forEach(e => {
		serversNumber++
		membersNumber = membersNumber + e.memberCount
	})
	return { servers: serversNumber, members: membersNumber }
}

const GetExactVoiceName = (vc, isPremium) => {

	if (String(vc).toLowerCase() == "custom") {

		if (isPremium === true) {
			return {
				Name: "Custom",
				Id: "Custom"
			}
		}
		return
	}

	const finded = GetAllVoices().find(e => {
		if (e.Name.toLowerCase() === vc.toLowerCase() || e.Id.toLowerCase() === vc.toLowerCase()) return true
	})
	return finded
}

const CreateUser = async (props) => {
	return await users.create(props)
}

const CreateGuild = async (props) => {
	return await servers.create(props)
}

const VoiceManager = async ({ userid, voice, text, voiceChannelId, guildId }) => {
	try {
		let guildData = await servers.findOne({ guildid: guildId })
		let userData = await users.findOne({ userid: userid })

		if (guildData === null) { // En esta parte se crea la data del servidor
			guildData = await CreateGuild({
				guildid: guildId,
			})
		}

		if (userData === null) { // En esta parte se crea la data del usuario
			userData = await CreateUser({
				userid: userid,
			})
		}

		if (!voiceChannelId) return {
			success: false,
			message: "No te encuentras en ningun canal de voz"
		}

		const guild = await client.guilds.fetch(guildId)
		if (!guild) return {
			success: false,
			message: `Error al obtener servidor: ${voiceChannelId}`
		}

		const vc = await guild.channels.fetch(voiceChannelId)
		if (!vc) return {
			success: false,
			message: `Error al obtener canal de voz: ${voiceChannelId}`
		}

		if (!vc.joinable) return {
			success: false,
			message: "No puedo entrar al canal de voz!"
		}
		console.log("Voice:", voice)
		if ((voice || userData.voice).toLowerCase() == "custom" && (guildData.premium === false && userData.premium === false)) {
			return {
				success: false,
				message: "No tenés permiso para usar la voz 'custom'"
			}
		}

		if ((voice || userData.voice).toLowerCase() == "custom") {

			const options = {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
					"xi-api-key": process.env.AI_VOICE_API_KEY
				},
				body: JSON.stringify({
					model_id: "eleven_multilingual_v2",
					text: text,
					
				})
			};

			const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${userData.customvoice.selectedId}`, options)
			console.log("custom voice res:", res.status)
			const audioBuffer = await res.arrayBuffer()
			const folderTrace = path.join(__dirname, "../..", `/src/audio/${guildId}.mp3`)
			const data = fs.writeFileSync(folderTrace, Buffer.from(audioBuffer), "base64")
			const connection = joinVoiceChannel({
				channelId: voiceChannelId,
				guildId: guildId,
				adapterCreator: guild.voiceAdapterCreator
			})
			const player = createAudioPlayer()
			const resource = createAudioResource(folderTrace, { inlineVolume: true })
			resource.volume.setVolume(0.5)
			connection.subscribe(player)
			player.play(resource)
			return {
				success: true,
				message: text
			}
		} else {
			const connection = joinVoiceChannel({
				channelId: voiceChannelId,
				guildId: guildId,
				adapterCreator: guild.voiceAdapterCreator
			})

			const res = await CreateVoice(text, voice || userData.voice, guildId)
				.then(FileName => {
					const player = createAudioPlayer()
					const parte = path.join(__dirname, "../..", `/src/audio/${FileName}.mp3`)
					const resource = createAudioResource(parte, { inlineVolume: true })
					resource.volume.setVolume(guildData.volume)
					connection.subscribe(player)
					player.play(resource)
					return {
						success: true,
						message: text
					}
				})
				.catch(err => {
					console.log("Error catch, CreateVoice()")
					console.log(err)
					return {
						success: false,
						message: "Error al crear archivo de voz"
					}
				}
				)

			return {
				success: res.success,
				message: res.message
			}
		}
	} catch (err) {
		console.log("error catch")
		console.log(err)
		return {
			success: false,
			message: "Error VoiceManager() final catch()"
		}
	}

}


export { GetCounts, VoiceManager, CreateUser, CreateGuild, GetExactVoiceName }