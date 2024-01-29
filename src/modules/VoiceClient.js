import AWS from "aws-sdk"
import fs from "fs"
import { URL } from "url"
import "dotenv/config"

const Polly = new AWS.Polly({
	region: "eu-central-1"
})

let Voices = []

const UpdateVoicesList = async () => {
	Polly.describeVoices((err, vc) => {
		if (!err) {
			Voices = vc.Voices
		}
	})
}

const GetAllVoices = () => {
	return Voices
}

const GetVoice = (Voice) => {
	const Finded = Voices.find(v => {
		if (v.Id.toLowerCase() === Voice.toLowerCase() || v.Name.toLowerCase() === Voice.toLowerCase()) {
			return true
		}
	})
	return Finded
}

const CreateVoice = async (Text, Voice = "miguel", AudioName) => {
	try {
		const promesa = new Promise((resolve, reject) => {

			const VoiceConfig = GetVoice(Voice)

			const tts_settings = {
				Engine: VoiceConfig.SupportedEngines[0],
				LanguageCode: VoiceConfig.LanguageCode,
				OutputFormat: "mp3",
				Text: Text,
				TextType: "text",
				VoiceId: VoiceConfig.Id
			}

			Polly.synthesizeSpeech(tts_settings, async (err, data) => {
				if (err) {
					reject("Error al sintetizar")
				}
				if (!err && data.AudioStream) {
					console.log(data)
					const location = `./src/audio/${AudioName}.mp3`
					const exist = await fs.existsSync(location)
					fs.writeFile(exist ? location : "./src/audio/Default.mp3", data.AudioStream, "base64", (err) => {
						if (err) {
							console.log("Erro al guardar audio")
							reject("Error al guardar el audio")
						} else {
							resolve(data.AudioStream)
						}
					})
				} else {

				}
			})
		})
		return promesa
	} catch (err) {
		return
	}

}

UpdateVoicesList()

export { CreateVoice, GetVoice, GetAllVoices }