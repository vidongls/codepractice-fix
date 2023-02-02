const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const { getDatabase , ref, get, set, push, remove, update, onValue } = require("firebase/database");

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: "codepractice-6317b.firebaseapp.com",
	databaseURL: process.env.FIREBASE_DATABASE_URL,
	projectId: "codepractice-6317b",
	storageBucket: "codepractice-6317b.appspot.com",
	messagingSenderId: "980818069611",
	appId: process.env.FIREBASE_APP_ID,
	measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const firebaseDb = getDatabase(app);

// const fireSet = async (path, data) => {
// 	const response = await set(ref(firebaseDb, path), data);
// 	return response;
// };

// const fireGet = (path, cb) => {
// 	onValue(ref(firebaseDb, path), (snapshot) => {
// 		const data = snapshot.val();
// 		cb(data);
// 	});
// };

module.exports = {
	firebaseDb
};
