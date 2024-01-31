import { Schema, Types, model } from "mongoose";

const schema = new Schema({
	userid: { type: String, required: true, unique: true},
	voice: { type: String, required: false, default: "miguel"}
})

const users = model("tts-userdata", schema)

export default users