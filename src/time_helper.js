exports.getNow = function getNow(include_day) {
	// current timestamp in milliseconds
	let ts = Date.now();

	let date_ob = new Date(ts);
	let date = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();
	let hours = date_ob.getHours();
	let min = date_ob.getMinutes();
	let sec = date_ob.getSeconds();

	let time = `${hours}:${min}:${sec}`
	if (include_day) {
		return `${year}-${month}-${date}: ${time}`
	} else {
		return time;
	}
}

exports.getDay = function getDay() {
	// current timestamp in milliseconds
	let ts = Date.now();

	let date_ob = new Date(ts);
	let date = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();

    return `${year}-${month}-${date}`
}