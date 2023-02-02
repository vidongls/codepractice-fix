const validatePassword = (password) => {
	const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,36}$/;
	return regex.test(password);
};

const validateEmail = (email) => {
	const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return regex.test(email);
};

module.exports = { validateEmail, validatePassword };
