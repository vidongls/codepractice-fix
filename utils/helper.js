const generateId = () => {
	const reducer = (accumulator, currentValue) => accumulator + currentValue;

	const date = new Date().toISOString();
	const numericArray = new Array();
	date.split("T")[0]
		.split("-")
		.forEach((ele) => numericArray.push(parseInt(ele)));
	date.split("T")[1]
		.split(":")
		.forEach((ele) => numericArray.push(parseFloat(ele)));
	let id = numericArray.reduce(reducer);

	return id.toString().replace(".", "").substr(1, 6);
};

module.exports = {
	generateId,
};
