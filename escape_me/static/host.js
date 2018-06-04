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
            update_database_table(msg.data.all_hints);
            set_hint_requested(msg.data.state.hint_requested);
            return;
        }
        log_entry(msg.event, msg.data);
        if (msg.event === "hint request") {
            set_hint_requested(true);
        }
        if (msg.event === "hint set") {
            set_hint_requested(false);
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

function set_hint_requested(on_off) {
    if (on_off) {
        $('#hint_requested').html("true");
        notifyHintRequested();
    } else {
        $('#hint_requested').html("false");
    }
}

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
            '<td>' + '<button class="hint_use">+</button><button class="hint_edit">edit</button>' + '</td>' +
            '<td>' + '' + '</td>' +
            '<td class="hint_body"><span>' + element.body + '</span></td>' +
            '</tr>'
        )
    });
    $('#database tr.table_row button.hint_use').click(function(event){
        let body = $(event.target).parents('.table_row').find('.hint_body span');
        $('#emit_data').val(body.html())
    });
    $('#database tr.table_row button.hint_edit').click(function(event){
        var edit_btn = $(event.target);
        var table_row = edit_btn.parents('.table_row');
        var body_text = table_row.find('.hint_body span');
        var textarea = $('<textarea cols="60" rows="5" id="row_editor"></textarea>')
        var apply_btn = $('<button>Apply</button>');
        var cancel_btn = $('<button>Cancel</button>');
        function reset_edit() {
            edit_btn.show();
            body_text.show();
            apply_btn.remove();
            cancel_btn.remove();
            textarea.remove();
        }
        apply_btn.click(event => {
            let row_id = table_row.attr('row_id');
            let new_body = textarea.val();
            console.log("edited: " + row_id + ": " + new_body);
            socket.emit('hint_save', {data: new_body, row_id: row_id});
            reset_edit();
        })
        cancel_btn.click(reset_edit);

        edit_btn.parent().append(apply_btn);
        edit_btn.parent().append(cancel_btn);
        edit_btn.hide();
        textarea.val(body_text.html())
        body_text.parent().append(textarea);
        body_text.hide();
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