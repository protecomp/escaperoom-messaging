var sec_left = 3600;
var updateIntervalId = false;


function update_handler() {
	document.getElementById('counter').textContent = Math.floor(sec_left / 60) + ':' + ("" + sec_left % 60).padStart(2, "0");
	socket.emit('counter_event', {sec: sec_left});
	sec_left -= 1;
}

function start_counter() {
	console.log("Counter start");
	if (!updateIntervalId) {
		updateIntervalId = setInterval(update_handler, 1000);
		update_handler();
	}
}

function stop_counter() {
	console.log("Counter stop");
	clearInterval(updateIntervalId);
	updateIntervalId = false;
}

function reset_counter() {
	console.log("Counter reset");
	clearInterval(updateIntervalId);
	updateIntervalId = false;
	sec_left = 3600;
	update_handler();
	sec_left = 3600;
}

