const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
		answerContent: { type: String },
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		isResolved: { type: Boolean, required: true },
		compileResult: [
			{
				data: String,
				expectedOutput: String,
				status: Boolean,
				testCaseInput: String,
			},
		],
		isSubmit: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("UserDoChallenge", userSchema);
