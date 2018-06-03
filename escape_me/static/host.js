$(document).ready(function() {

    // Connect to the Socket.IO server.
    var socket = io.connect();

    // Set a ping loop and pong event handler
    var TIMEOUT_MS = 5000;
    var ping_time = -1;
    var last_reponse = -1;
    var ping_loop = setInterval(function() {
        socket.emit('ping');
        if (ping_time === -1) {
            ping_time = (new Date()).getTime();
        } else {
            update_ping();
            $('#connection_status').text("Connection lost")
        }
    }, 1000)
    function update_ping() {
        time_diff = (new Date()).getTime() - ping_time;
        $('#ping-pong').text(time_diff);
    }
    socket.on('pong', function() {
        $('#connection_status').text("Connected")
        if (ping_time !== -1) {
            update_ping();
        }
        ping_time = -1;
    });

    // Event handler for new connections.
    // The callback function is invoked when a connection with the
    // server is established.
    socket.on('connect', function() {
        socket.emit('my_event', {data: 'Host connected!'});
        $('#connection_status').text("Connected")
        console.log("Connected");
    });
    // Event handler for server sent data.
    // The callback function is invoked whenever the server emits data
    // to the client. The data is then displayed in the "Received"
    // section of the page.
    socket.on('my_response', function(msg) {
        log_entry(msg.event, msg.data);
        if (msg.event === "hint request") {
            $('#send_btn').removeAttr('disabled');
        }
        if (msg.event === "hint set") {
            $('#send_btn').attr('disabled', true);
        }
    });


    // Handlers for the different forms in the page.
    // These accept data from the user and send it to the server in a
    // variety of ways
    $('#send_btn').click(function(event) {
        let val = $('#emit_data').val();
        if (val.length > 0) {
            socket.emit('my_message', {data: $('#emit_data').val()});
        }
    });


    $('#save_btn').click(function(event) {
        let val = $('#emit_data').val();
        if (val.length > 0) {
            socket.emit('hint_save', {data: $('#emit_data').val()});
        }
    });
});

function log_entry(event, data) {
    if (event == undefined) {
        event = "";
    }
    $('#log').append('<tr>'+
        '<td>' + (new Date).toLocaleTimeString('fi-FI') + '</td>' +
        '<td>' + event + '</td>' +
        '<td>' + data + '</td>' +
        '</tr>'
    );

}
