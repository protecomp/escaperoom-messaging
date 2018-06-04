import React, { Component } from 'react';
import socketIOClient from 'socket.io-client'
import '../css/App.css';

class App extends Component {
  constructor() {
    super()
    
    this.state = {
      endpoint: "http://localhost:5000" // this is where we are connecting to with sockets
    }
    this.socket = socketIOClient(this.state.endpoint)

        // Set a ping loop and pong event handler
    this.TIMEOUT_MS = 5000;
    this.ping_time = -1;
    this.last_reponse = -1;
    this.ping_loop = setInterval(() => {
        this.socket.emit('ping');
        if (this.ping_time === -1) {
            this.ping_time = (new Date()).getTime();
        } else {
            this.update_ping();
            //$('#connection_status').text("Connection lost")
        }
    }, 1000)

  }
  
  // method for emitting a socket.io event
  send = () => {
    // this emits an event to the socket (your server) with an argument of 'red'
    // you can make the argument any color you would like, or any kind of data you want to send.
    
    console.log("sending")
    this.socket.emit('my_message', {data: 'react message'}) 
    // socket.emit('change color', 'red', 'yellow') | you can have multiple arguments
  }

    update_ping = () => {
        const time_diff = (new Date()).getTime() - this.ping_time;
        //$('#ping-pong').text(time_diff);
    }

    log_entry = (event, data) => {
        if (event === undefined) {
            event = "";
        }
        // $('#log').append('<tr>'+
        //     '<td>' + (new Date).toLocaleTimeString('fi-FI') + '</td>' +
        //     '<td>' + event + '</td>' +
        //     '<td>' + data + '</td>' +
        //     '</tr>'
        // );
    
    }
    
    update_database_table = (rows) => {
        // $('#database tr.table_row').remove();
        // rows.forEach(element => {
        //     // $('#database').append(
        //     //     '<tr class="table_row" row_id="'+ element.id +'">' +
        //     //     '<td>' + '<input class="hint_delete" type="checkbox">' + '</td>' +
        //     //     '<td>' + '<button>+</button>' + '</td>' +
        //     //     '<td>' + '' + '</td>' +
        //     //     '<td class="hint_body">' + element.body + '</td>' +
        //     //     '</tr>'
        //     // )
        // });
        // $('#database tr.table_row button').click(function(event){
        //     let body = $(event.target).parents('.table_row').children('.hint_body');
        //     //$('#emit_data').val(body.html())
        // });
    }
    
    handle_database_delete = (event) => {
        let to_remove = [];
        // $('#database tr.table_row').each((i, element) => {
        //     if ($(element).find('.hint_delete').attr('checked')) {
        //         to_remove.push($(element).attr('row_id'));
        //     }
        // });
        if (to_remove.length > 0) {
            this.socket.emit('hint_delete', {data: to_remove});
        }
        console.log(to_remove);
    }
  // render method that renders in code if the state is updated
  render() {
    

    
    this.socket.on('pong', () =>  {
    //$('#connection_status').text("Connected")
    if (this.ping_time !== -1) {
        this.update_ping();
    }
    this.ping_time = -1;
    });

    // Event handler for new connections.
    // The callback function is invoked when a connection with the
    // server is established.
    this.socket.on('connect', () => {
        this.socket.emit('my_event', {data: 'Host connected!'});
        //$('#connection_status').text("Connected")
        console.log("Connected");
    });
    // Event handler for server sent data.
    // The callback function is invoked whenever the server emits data
    // to the client. The data is then displayed in the "Received"
    // section of the page.
    this.socket.on('my_response', (msg) => {
        console.log(msg);
        if (msg.event === "database") {
            this.log_entry(msg.event, "received " + msg.data.length + " rows");
            this.update_database_table(msg.data);
            return;
        }
        this.log_entry(msg.event, msg.data);
        if (msg.event === "hint request") {
            //$('#send_btn').removeAttr('disabled');
        }
        if (msg.event === "hint set") {
            //$('#send_btn').attr('disabled', true);
        }
    });
    return (
      <html>
      <head>
          <title>Escape room messaging</title>
      </head>
      <body>
      <table><tr>
      <td>
          <h1>Send message to escape room player</h1>
          <p>Async mode is: <b></b> (<span id="connection_status">Not Connected</span>)</p>
          <p>Average ping/pong latency: <b><span id="ping-pong"></span>ms</b></p>
          <h2>Send:</h2>
          <textarea cols="60" rows="5" id="emit_data" name="emit_data"></textarea>
          <br />
          <button id="send_btn" disabled>Lähetä</button>
          <button id="save_btn">Tallenna</button>
          <h2>Receive:</h2>
          <table id="log">
              <tr>
                <th>Time</th>
                <th>Event</th> 
                <th>Data</th>
              </tr>
          </table>
      </td>
      <td>
          <table id="database">
              <tr class="table_header">
                  <th><button id="db_delete_btn">Delete</button></th>
                  <th></th>
                  <th>Room</th>
                  <th>Body</th> 
              </tr>
          </table>
      </td>
      </tr>
      </table>
      </body>
      </html>
    )
  }
}
export default App;
