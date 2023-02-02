const jwt = require("jsonwebtoken");
const { get } = require("lodash");
const UserModel = require("../models/usersModel");

const jwtAuth = async (req, res, next) => {
	let token;
	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		try {
			token = req.headers.authorization.split(" ")[1];

			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = decoded;
			const userId = get(decoded, "userId");
			if (userId) {
				const users = await UserModel.findById(userId);

				if (users) {
					next();
				} else {
					res.status(401).json({ msg: "Not authorized, token failed" });
				}
			} else {
				res.status(401).json({ msg: "Not authorized, token failed" });
			}
		} catch (error) {
			console.log("🧙 ~ error", error);
			res.status(401).json({ msg: "Not authorized, token failed" });
		}
	}

	if (!token) {
		res.status(401).json({ msg: "Not authorized, token failed" });
		throw new Error("Not authorized, no token");
	}
};

// 1: Không truyền token
// 2: verify chuỗi đó có phải token
// 3: message trả về dc custom
// fix lai ten middleware

module.exports = { jwtAuth };
