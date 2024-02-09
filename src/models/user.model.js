import { Schema, Types, model } from "mongoose";

const schema = new Schema({
	userid: { type: String, required: true, unique: true},
	voice: { type: String, required: false, default: "miguel"},
	premium: { type: Boolean, required: false, default: false},
	customvoice: {
		selectedName: { type: String, required: false, default: "glinda"},
		selectedId: { type: String, required: false, default: "z9fAnlkpzviPz146aGWa"},
		stability: { type: Number, required: false, default: 0.5},
		similarity: { type: Number, required: false, default: 0.5},
		exaggeration: { type: Number, required: false, default: 0}
	}
})

const users = model("tts-userdata", schema)

export default users