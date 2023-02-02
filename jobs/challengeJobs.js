const cron = require("node-cron");
const { fireDelete } = require("../services/firebaseUntil");
const challengeModel = require("../models/challengeModel");

function timeConvert(num) {
	let hours = Math.floor(num / 60);
	let minutes = num % 60;
	console.log({ hours, minutes });
	return { hours, minutes };
}

const challengeEndedJob = (time, path, idChallenge) => {
	// ${timeConvert(time).minutes} ${get(timeConvert(time), "hours") ? get(timeConvert(time), "hours") : "*"}
	const timeSchedule = `5 * * * * *`;

	// const scheduler = cron.schedule(timeSchedule, async () => {
	// 	console.log("run");
	// 	fireDelete(path);

	// 	try {

	// 	} catch (error) {
	// 		console.log(error);
	// 	}
	// });
	// scheduler.start();

	setTimeout(async () => {
		const challenge = await challengeModel.findById(idChallenge);
		challenge.status = "SUCCESS";
		challenge.save();
		fireDelete(path);
		console.log("zooooo");
		// scheduler.stop();
	}, time);
	//;
};

module.exports = {
	challengeEndedJob,
};
