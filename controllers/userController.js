const UserModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const sendMail = require("../utils/sendMail");
const { generateId } = require("../utils/helper");

const register = async (req, res, next) => {
	const { userName, email, password, firstName, lastName } = req.body;

	const userExists = await UserModel.findOne({ email });

	if (userExists) {
		res.status(400).send({ code: "USER_EXISTED", msg: "User already existed" });
		throw new Error("User already existed");
	}

	try {
		const code = "ST" + generateId();
		await UserModel.create({
			userName,
			email,
			password,
			code,
			class: [],
			challengeResolved: [],
			avatar: "",
			isDisable: false,
			role: "USER",
			firstName,
			lastName,
		});

		res.status(201).json({
			code: "SUCCESS",
			msg: "Register success",
		});

		sendMail({ userName, email });
	} catch (error) {
		console.log("🧙 ~ error", JSON.stringify(error, null, 2));
		res.status(400).json(error);
		throw new Error("Invalid User data");
	}
};

const login = async (req, res, next) => {
	const { email, password } = req.body;
	try {
		const user = await UserModel.findOne({ email });

		if (user) {
			bcrypt.compare(password, user.password, (err, data) => {
				if (err) throw err;

				if (data) {
					res.status(200).json({
						id: user._id,
						email: user.email,
						userName: user.userName,
						role: user.role,
						token: generateToken({
							userId: user._id,
							email: user.email,
							userName: user.userName,
							role: user.role,
							classes: user.classes,
						}),
					});
				} else {
					return res.status(401).json({ code: "ACCOUNT_INVALID", msg: "Wrong email or password!" });
				}
			});
		} else {
			res.status(404).json({ code: "ACCOUNT_INVALID", msg: "Wrong email or password!" });
			throw new Error("Wrong email or password!");
		}
	} catch (error) {
		console.log("🧙 ~ error--login", error);
		res.status(404).json({ code: "ACCOUNT_INVALID", msg: error });
		throw new Error("Wrong email or password!");
	}
};

const logout = async (req, res, next) => {
	// req.session.destroy((err) => {
	// 	// callback function. If an error occurs, it will be accessible here.
	// 	if (err) {
	// 		console.error(err);
	// 		res.status(400).send({ msg: err });
	// 	}
	// 	res.status(200).send({ code: "LOGOUT", msg: "Logout success!" });
	// });
	// res.status(200).send({ code: "LOGOUT", msg: "Logout success!" });
};

const getUserByKeyword = async (req, res, next) => {
	const { keyword } = req.query;

	const users = await UserModel.find({
		$or: [{ code: { $regex: ".*" + keyword + ".*" } }, { userName: { $regex: ".*" + keyword + ".*" } }],
	}).select("-password");
	res.json(users);
};

const getUserInfo = async (req, res, next) => {
	const { userId } = req.user;

	const users = await UserModel.findById(userId)
		.select("-password")
		.populate({
			path: "classes",
			populate: {
				path: "authorId",
				select: "firstName lastName avatar",
			},
			select: "name authorId",
		});
	res.json(users);
};

module.exports = {
	register,
	login,
	logout,
	getUserByKeyword,
	getUserInfo,
};
