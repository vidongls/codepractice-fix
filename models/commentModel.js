const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
	{
		content: { type: String, required: true },
		challengeId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
            ref: "User"
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
