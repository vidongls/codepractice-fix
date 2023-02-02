const mongoose = require("mongoose");

const classSchema = mongoose.Schema(
	{
		authorId: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "User" },
		name: { type: String, required: true },
		students: [{ type: mongoose.Schema.Types.ObjectId, require: true, ref: "User" }],
		code: { type: String, require: true, unique: true },
		challenges: [{ type: mongoose.Schema.Types.ObjectId, require: true, ref: "Challenge" }],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
