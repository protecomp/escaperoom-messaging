$(document).ready(function() {

    // Connect to the Socket.IO server.
    var socket = io.connect();
    var message = "";

    text_animate_loop = null;
    function text_animate() {
        var new_char = message.charAt($('#msg').text().length)
        $('#msg').text($('#msg').text() + new_char)
        if (message.length == $('#msg').text().length) {
            clearInterval(text_animate_loop);
        }
    }

    // Event handler for new connections.
    // The callback function is invoked when a connection with the
    // server is established.
    socket.on('connect', function() {
        socket.emit('my_event', {data: 'I\'m connected!'});
        console.log("Connected");
    });
    // Event handler for server sent data.
    // The callback function is invoked whenever the server emits data
    // to the client. The data is then displayed in the "Received"
    // section of the page.
    socket.on('set_message', function(msg) {
        $('#msg').text("")
        message = msg['data'];
        clearInterval(text_animate_loop);
        text_animate_loop = setInterval(text_animate, 100);
    });

    $('#request_btn').on('click', function(event) {
        socket.emit('hint_request');
        console.log("hint_request")
    });
});