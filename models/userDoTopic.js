const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
	{
		userId: [mongoose.Schema.Types.ObjectId],
		topicId: [mongoose.Schema.Types.ObjectId],
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		countChallengeResolve: { type: Number, required: true },
		point: { type: Number, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("UserDoTopic", userSchema);
