const { check } = require("express-validator");

let validateDataSubmit = () => {
	return [
		check("challengeId", "Invalid does not Empty").isEmpty(),
		check("answerContent", "Invalid email").isEmpty(),
		check("compileResult", "password more than 6 degits").isEmpty(),
	];
};

module.exports = {
	validateDataSubmit: validateDataSubmit,
};
