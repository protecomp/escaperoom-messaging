var socket;
var el_hint_body;

$(document).ready(function() {

    el_hint_body = $('#emit_data');

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

    socket.on('connect', function() {
        $('#connection_status').text("Connected")
        socket.emit('host_connected');
        console.log("Connected");
    });
    
    socket.on('database', function(data) {
        log_entry('database' ,'state: ' + JSON.stringify(data.state));
        update_database_table(data.all_hints);
        set_hint_requested(data.state.hint_requested);
        if (data.state.hint_available) {
            set_hint_body(data.state.hint_body)
        }
        update_hint_available(data.state.hint_available);
        update_showing_hint_body(data.state.hint_body)
    });
    socket.on('hint_request', function(msg) {
        log_entry('hint_request' ,'Hint requested');
        notifyHintRequested();
        set_hint_requested(true);
    });
    socket.on('hint_send', function(msg) {
        log_entry('hint_set' ,'body: ' + msg.hint_body);
        set_hint_requested(false);
    });
    


    // Handlers for the different forms in the page.
    // These accept data from the user and send it to the server in a
    // variety of ways
    $('#send_btn').click(function(event) {
        let val = el_hint_body.val();
        if (val.length > 0) {
            socket.emit('hint_send', {hint_body: el_hint_body.val()});
            set_hint_body("");
        }
    });

    $('#save_btn').click(function(event) {
        let val = el_hint_body.val();
        if (val.length > 0) {
            socket.emit('hint_save', {hint_body: el_hint_body.val()});
        }
    });
    $('#db_delete_btn').click(handle_database_delete);

    $('#hint_clear_btn').click(function(event) {
        socket.emit('hint_clear');
    });
    $('#refresh_player').click(function(event) {
        socket.emit('refresh_player');
    })

    update_hint_available(false);
    $('#hint_available_btn').click(function(event) {
        let btn = $(event.target);
        if (btn.val() == 'true') {
            socket.emit('hint_available', {hint_available: false});
            update_hint_available(false);
        } else {
            socket.emit('hint_available', {
                hint_available: true, hint_body: el_hint_body.val()
            });
            update_hint_available(true);
        }
    });
});

function update_showing_hint_body(value) {
    $('#showing_hint_body').html(value);
}

function set_hint_body(value) {
    if (!el_hint_body.attr('disabled')) {
        el_hint_body.val(value)
    }
}

function update_hint_buttons() {
    let empty = (el_hint_body.val().length === 0);
    $('#send_btn').attr('disabled', empty);
    $('#save_btn').attr('disabled', empty);
}

function update_hint_available(available) {
    if (available) {
        $('#hint_available_btn').html('Poista vihje saatavilta')
        $('#hint_available_btn').val('true')
        $('#hint-avail-indicator').show();
        el_hint_body.attr('disabled', true);
    } else {
        $('#hint_available_btn').html('Aseta vihje saataville')
        $('#hint_available_btn').val('false')
        $('#hint-avail-indicator').hide();
        el_hint_body.attr('disabled', false);
    }
}

function set_hint_requested(on_off) {
    if (on_off) {
        $('#hint_requested').html("true");
        $('#hint-req-indicator').show();
    } else {
        $('#hint_requested').html("false");
        $('#hint-req-indicator').hide();
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
        set_hint_body(body.html())
        update_hint_buttons();
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
            socket.emit('hint_save', {hint_body: new_body, row_id: row_id});
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