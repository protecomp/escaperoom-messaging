var hint_body = "";

$(document).ready(function() {

    // Connect to the Socket.IO server.
    var socket = io.connect();
    var initial = true;

    socket.on('player_ping', function() {
        socket.emit('player_pong');
    });
    socket.on('hint_send', function(msg) {
        set_hint(msg['hint_body']);
    });
    socket.on('database', function(data) {
        console.log(data)
        animate_hint_requested(data.state.hint_requested);
        if (initial) {
            initial = false;
            set_hint(data.state.hint_body, no_animation = true);
        }
    });

    $('#request_btn').on('click', function(event) {
        socket.emit('hint_request');
        console.log("hint_request")
    });
});

function set_hint(new_hint_body, no_animation = false) {
    $('#msg').text("")
    hint_body = new_hint_body;
    clearInterval(text_animate_loop);
    if (!no_animation) {
        text_animate_loop = setInterval(text_animate, 100);
    } else {
        $('#msg').text(new_hint_body);
    }
    animate_hint_requested(false);
}

text_animate_loop = null;
function text_animate() {
    var new_char = hint_body.charAt($('#msg').text().length)
    $('#msg').text($('#msg').text() + new_char)
    if (hint_body.length == $('#msg').text().length) {
        console.log("Done animating!");
        clearInterval(text_animate_loop);
        $('#request_btn').removeAttr('disabled');
    }
}

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