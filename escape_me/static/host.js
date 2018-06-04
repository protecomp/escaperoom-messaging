var socket;

$(document).ready(function() {

    // Connect to the Socket.IO server.
    socket = io.connect();

    // Set a ping loop and pong event handler
    var TIMEOUT_MS = 5000;
    var ping_time = -1;
    var player_ping_time = -1;
    var last_reponse = -1;
    var ping_loop = setInterval(function() {
        socket.emit('ping');
        if (ping_time === -1) {
            ping_time = (new Date()).getTime();
        } else {
            update_ping();
            $('#connection_status').text("Connection lost")
        }

        // Ping to player view
        socket.emit('player_ping');
        if (player_ping_time === -1) {
            player_ping_time = (new Date()).getTime();
        } else {
            $('#player-ping-pong').text("-");
            $('#player_connection_status').text("Player not connected")
        }
    }, 1000)
    function update_ping() {
        time_diff = (new Date()).getTime() - ping_time;
        $('#ping-pong').text(time_diff);
    }
    function update_player_ping() {
        time_diff = (new Date()).getTime() - player_ping_time;
        $('#player-ping-pong').text(time_diff);
    }
    socket.on('pong', function() {
        $('#connection_status').text("Connected")
        if (ping_time !== -1) {
            update_ping();
        }
        ping_time = -1;
    });
    socket.on('player_pong', function() {
        $('#player_connection_status').text("Player connected")
        if (player_ping_time !== -1) {
            update_player_ping();
        }
        player_ping_time = -1;
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
        console.log(msg);
        if (msg.event === "database") {
            log_entry(msg.event, "received " + msg.data.length + " rows");
            update_database_table(msg.data);
            return;
        }
        log_entry(msg.event, msg.data);
        if (msg.event === "hint request") {
            notifyHintRequested();
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
    $('#db_delete_btn').click(handle_database_delete);
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

function update_database_table(rows) {
    $('#database tr.table_row').remove();
    rows.forEach(element => {
        $('#database').append(
            '<tr class="table_row" row_id="'+ element.id +'">' +
            '<td>' + '<input class="hint_delete" type="checkbox">' + '</td>' +
            '<td>' + '<button>+</button>' + '</td>' +
            '<td>' + '' + '</td>' +
            '<td class="hint_body">' + element.body + '</td>' +
            '</tr>'
        )
    });
    $('#database tr.table_row button').click(function(event){
        let body = $(event.target).parents('.table_row').children('.hint_body');
        $('#emit_data').val(body.html())
    });
}

function handle_database_delete(event) {
    to_remove = [];
    $('#database tr.table_row').each((i, element) => {
        if ($(element).find('.hint_delete').attr('checked')) {
            to_remove.push($(element).attr('row_id'));
        }
    });
    if (to_remove.length > 0) {
        socket.emit('hint_delete', {data: to_remove});
    }
    console.log(to_remove);
}

function enable_notifications() {
    
    if (!Notification) {
        $('#notification_status').text("Desktop notifications not available in your browser. Try Chrome.");
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission().then(function(result) {
            if (result === "granted") {
                $('#notification_status').text("Enabled");
                console.log("Notifications enabled");
            } else {
                $('#notification_status').text("Disabled");
                console.log("Notifications disabled");
            }
        });

}
document.addEventListener('DOMContentLoaded', enable_notifications);

function notifyHintRequested() {
    if (Notification.permission === "granted") {
        var notification = new Notification('Player requested a hint!', {
          body: "Hint request from room ###",
        });

        notification.onclick = function () {
          window.open(window.location.href);      
        };
    }
}