$(document).ready(function() {

    // Connect to the Socket.IO server.
    var socket = io.connect();

    // Set a ping loop and pong event handler
    var ping_time = 0;
    var ping_loop = setInterval(function() {
        socket.emit('ping');
        ping_time = (new Date()).getTime();
    }, 1000)
    socket.on('pong', function() {
        time_diff = (new Date()).getTime() - ping_time
        curr_ping = parseInt($('#ping-pong').text());
        if (isNaN(curr_ping)) { curr_ping = 0; }
        $('#ping-pong').text(Math.floor((curr_ping + time_diff)/2));
    });

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
    socket.on('my_response', function(msg) {
        $('#log').append('<br>' + $('<div/>').text('Sent message: ' + msg.data).html());
    });


    // Handlers for the different forms in the page.
    // These accept data from the user and send it to the server in a
    // variety of ways
    $('form#emit').submit(function(event) {
        socket.emit('my_message', {data: $('#emit_data').val()});
        return false;
    });
    $('form#disconnect').submit(function(event) {
        socket.emit('disconnect_request');
        return false;
    });
});