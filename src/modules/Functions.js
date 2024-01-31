import users from "../models/user.model.js"

const UpdateActivity = (Client, ActivityText) => {
}

const GetCounts = (Client) => {
	let servers = 0
	let members = 0
	Client.guilds.cache.forEach(e => {
		servers++
		members = members + e.memberCount
	})
	return { servers, members }
}

const DetectVoice = ({ userid, voice, text }) => {

}

export { GetCounts }