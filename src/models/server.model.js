import { Schema, Types, model } from "mongoose";

const schema = new Schema({
	guildid: { type: String, required: true, unique: true},
	defaultvoice: { type: String, required: false, default: "miguel"},
	selfvoices: { type: Boolean, required: false, default: false},
	premium: { type: Boolean, required: false, default: false},
	pitch: { type: Number, required: false, default: 1},
	volume: { type: Number, required: false, default: 1.5}
})

const servers = model("tts-serverdata", schema)

export default servers