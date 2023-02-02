const { firebaseDb } = require("./firebase");

const { getDatabase, ref, get, set, push, remove, update, onValue } = require("firebase/database");

const fireGet = (path, cb) => {
	onValue(
		ref(firebaseDb, path),
		(snapshot) => {
			const data = snapshot.val();
			cb(data);
		},
		(error) => {
			console.log("🧙 ~ error", error);
		}
	);
};

const fireGetOne = (path) => {
	return new Promise((resolve, reject) => {
		onValue(
			ref(firebaseDb, path),
			(snapshot) => {
				const data = snapshot.val();
				resolve(data);
			},
			(error) => {
				console.log("🧙 ~ error", error);
				reject(error);
			},
			{ onlyOnce: true }
		);
	});
};

const fireSet = async (path, data) => {
	const response = await set(ref(firebaseDb, path), data);
	return response;
};

const firePush = async (path, data) => {
	const response = await push(ref(firebaseDb, path), data);
	return response;
};

const fireUpdate = async (path, data) => {
	const response = await update(ref(firebaseDb, path), data);
	return response;
};

const fireDelete = async (path) => {
	const response = await remove(ref(firebaseDb, path));
	return response;
};

module.exports = {
	fireGet,
	fireSet,
	firePush,
	fireUpdate,
	fireDelete,
	fireGetOne,
};
