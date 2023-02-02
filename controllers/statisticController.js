const ChallengeModel = require("../models/challengeModel");
const userDoChallenge = require("../models/userDoChallenge");
const UserModel = require("../models/usersModel");

const statisticAll = async (req, res, next) => {
	const totalChallenge = await ChallengeModel.find({ isRealtime: false }).countDocuments();
	const totalSubmitChallenge = await userDoChallenge.find({}).countDocuments();

	const totalUser = await UserModel.find({}).countDocuments();

	const start = new Date();
	start.setHours(0, 0, 0, 0);

	const end = new Date();
	end.setHours(23, 59, 59, 999);

	const totalSubmitChallengeToday = await userDoChallenge
		.find({ createdAt: { $gte: start, $lte: end } })
		.countDocuments();

	res.status(200).json({ totalChallenge, totalSubmitChallenge, totalUser, totalSubmitChallengeToday });
};

module.exports = {
	statisticAll,
};

// 50%
