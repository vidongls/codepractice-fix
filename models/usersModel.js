const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { validatePassword, validateEmail } = require("../utils/validators");
const { userEnum } = require("../enums/enums");

const userSchema = mongoose.Schema(
	{
		userName: { type: String, required: true, trim: true },
		fistName: { type: String, trim: true },
		lastName: { type: String, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate: [validateEmail, { code: "INVALID_EMAIL", msg: "Invalid Email" }],
		},
		password: {
			type: String,
			required: true,
			trim: true,
			validate: [validatePassword, { code: "INVALID_PASSWORD", msg: "Invalid Password" }],
		},
		role: { type: String, required: true, enum: userEnum, default: "USER" },
		challengeResolved: [mongoose.Schema.Types.ObjectId],
		isDisable: { type: Boolean },
		avatar: { type: String },
		code: { type: String, unique: true, trim: true },
		classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
		// name: { type: String, trim: true, require: true },
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
	try {
		if (!this.isModified("password")) {
			return next();
		}
		const hashed = await bcrypt.hash(this.password, 12);
		this.password = hashed;
	} catch (err) {
		return next(err);
	}
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;

// nodemailer, bcrypt, mongoose schema middleware, enum
//
