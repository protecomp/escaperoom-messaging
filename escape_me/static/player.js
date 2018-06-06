$(document).ready(function() {

    // Connect to the Socket.IO server.
    var socket = io.connect();
    var message = "";

    text_animate_loop = null;
    function text_animate() {
        var new_char = message.charAt($('#msg').text().length)
        $('#msg').text($('#msg').text() + new_char)
        if (message.length == $('#msg').text().length) {
            console.log("Done animating!");
            clearInterval(text_animate_loop);
            $('#request_btn').removeAttr('disabled');
        }
    }

    socket.on('player_ping', function() {
        socket.emit('player_pong');
    });

    socket.on('set_message', function(msg) {
        $('#msg').text("")
        message = msg['hint_body'];
        clearInterval(text_animate_loop);
        text_animate_loop = setInterval(text_animate, 100);
        animate_hint_requested(false);
    });

    socket.on('my_response', function(msg) {
        console.log(msg)
        if (msg.event === "database") {
            let state = msg.data.state;
            animate_hint_requested(state.hint_requested);
            return;
        }
        if (msg.event === 'hint request') {
            animate_hint_requested(true);
        }
        if (msg.event === 'hint available') {
            console.log("hint available: " + msg.data)
        }
    });

    $('#request_btn').on('click', function(event) {
        socket.emit('hint_request');
        console.log("hint_request")
    });
});

hint_requested_loop = null;
function animate_hint_requested(start_stop) {
    // Stop the loop first.
    $('#request_btn').text('Request a hint');
    clearInterval(hint_requested_loop);
    hint_requested_loop = null;
    if (start_stop) {
        $('#request_btn').attr('disabled', true);
        $('#request_btn').text('Hint requested');
        // Start a loop that animates three dots
        hint_requested_loop = setInterval(function () {
            let new_label = $('#request_btn').text();
            if (new_label.length < 'Hint requested...'.length) {
                new_label += ".";
            } else {
                new_label = 'Hint requested'
            }
            $('#request_btn').text(new_label);
        }, 500)
    }
}