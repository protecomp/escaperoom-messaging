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
        animate_hint_available(data.state.hint_available);
        ip_address_visible(!data.state.host_was_found, data.state.ip_address);
        if (initial) {
            initial = false;
            set_hint(data.state.hint_body, animation = false);
        }
    });

    $('#request_btn').on('click', function(event) {
        socket.emit('hint_request');
        console.log("hint_request")
    });

    var ping_loop = setInterval(function() {
        socket.emit('check_host_status');
    }, 4000)
});

function set_hint(new_hint_body, animation = true) {
    $('#msg').text("")
    hint_body = new_hint_body;
    clearInterval(text_animate_loop);
    if (animation) {
        text_animate_loop = setInterval(text_animate, 100);
    } else {
        $('#msg').text(new_hint_body);
    }
    animate_hint_requested(false);
}

function normal_button() {
    $('#request_btn').css('background-position', '0 0');
}

function dark_button() {
    $('#request_btn').css('background-position', '80px 0');
}

function bright_button() {
    $('#request_btn').css('background-position', '160px 0');
}

text_animate_loop = null;
function text_animate() {
    var new_char = hint_body.charAt($('#msg').text().length)
    $('#msg').text($('#msg').text() + new_char)
    if (hint_body.length == $('#msg').text().length) {
        console.log("Done animating!");
        clearInterval(text_animate_loop);
    }
}

function ip_address_visible(visible, address = null) {
    if (visible) {
        $('#ipaddress span').text(address);
        $('#ipaddress').show();
    } else {
        $('#ipaddress').hide();
    }
}

hint_requested_loop = null;
function animate_hint_requested(start_stop) {
    // Stop the loop first.
    clearInterval(hint_requested_loop);
    hint_requested_loop = null;
    $('#indicator').text('');
    $('#request_btn').removeAttr('disabled');

    if (start_stop) {
        $('#request_btn').attr('disabled', true);
        // Start a loop that animates three dots
        hint_requested_loop = setInterval(function () {
            let new_label = $('#indicator').text();
            if (new_label.length < '...'.length) {
                new_label += ".";
            } else {
                new_label = ''
            }
            $('#indicator').text(new_label);
        }, 500)
    }
}

hint_available_loop = null;
button_normal = true;
function animate_hint_available(start_stop) {
    // Stop the loop
    normal_button();
    clearInterval(hint_available_loop);
    hint_available_loop = null;
    if (start_stop) {
        hint_available_loop = setInterval(function () {
            if (button_normal) {
                bright_button();
                button_normal = false;
            } else {
                normal_button();
                button_normal = true;
            }
        }, 500)
    }
}