const ChallengeModel = require("../models/challengeModel");
const CommentModel = require("../models/commentModel");

const createComment = async (req, res) => {
	const { content, challengeId } = req.body;

	try {
		const comment = await CommentModel.create({
			challengeId,
            author: req.user.userId,
			// author: {
			// 	userName: req.user.userName,
			// 	email: req.user.email,
			// },
			content,
		});
		const challenge = await ChallengeModel.findById(challengeId);
		challenge.comments.push(comment._id);
		await challenge.save();

		res.status(201).json({
			code: "SUCCESS",
			msg: "Create comment success",
			data: comment,
		});
	} catch (error) {
		res.status(400).send(error);
		throw new Error("Create comment error");
	}
};

module.exports = {
	createComment,
};
