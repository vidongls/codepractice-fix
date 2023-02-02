const mongoose = require("mongoose");
const { levelEnum, challengeStatusEnum } = require("../enums/enums");

const challengeSchema = mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		level: { type: String, required: true, enum: levelEnum, default: "MEDIUM" },
		code: { type: String, required: true, unique: true },
		describe: { type: String, required: true },
		testCase: [
			{
				input: { type: String, trim: true },
				output: { type: String, trim: true },
			},
		],
		content: { type: String, require: true },
		functionName: { type: String, require: true, trim: true },
		star: { type: Number, required: true, default: 0 },
		comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
		author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		isDisable: { type: Boolean, required: true, default: false },
		classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
		isRealtime: { type: Boolean, default: false },
		startedAt: { type: Date },
		time: { type: Number, default: 150000 },
		isExamStarted: { type: Boolean, default: false },
		status: { type: String, enum: challengeStatusEnum, default: "NEW" },
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

challengeSchema.virtual("countDoChallenge", {
	ref: "UserDoChallenge",
	localField: "_id",
	foreignField: "challenge",
});

module.exports = mongoose.model("Challenge", challengeSchema);
