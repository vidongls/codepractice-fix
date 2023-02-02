const roleMiddleware =
	(...roles) =>
	(req, res, next) => {
		const roleUser = req.user.role;
		if (!roles || !roles.includes(roleUser)) {
			throw new Error("No permission");
		}

		next();
		// your code here
	};

module.exports = {
	roleMiddleware,
};
