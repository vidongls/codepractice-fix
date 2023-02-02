const mongoose = require("mongoose");

const topicSchema = mongoose.Schema(
	{
		challenges: {
			type: [mongoose.Schema.Types.ObjectId],
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		time: {
			type: Number,
			required: true,
		},
		authorId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		isUsed: {
			type: Boolean,
			required: true,
		},
		isDisable: {
			type: Boolean,
			required: true,
		},
		students: {
			type: [mongoose.Schema.Types.ObjectId],
			required: true,
		},
		point: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
