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
  }
  
  // method for emitting a socket.io event
  send = () => {
    // this emits an event to the socket (your server) with an argument of 'red'
    // you can make the argument any color you would like, or any kind of data you want to send.
    
    console.log("sending")
    this.socket.emit('my_message', {data: 'react message'}) 
    // socket.emit('change color', 'red', 'yellow') | you can have multiple arguments
  }
  
  // render method that renders in code if the state is updated
  render() {
    
    // socket.on is another method that checks for incoming events from the server
    // This method is looking for the event 'change color'
    // socket.on takes a callback function for the first argument
    this.socket.on('my_response', (message) => {
      // setting the color of our button
      console.log(message)
    })
    this.socket.on('connect', (message) => {
      // setting the color of our button
      this.socket.emit('my_event', {data: 'Host connected!'});
      console.log(message)
    })
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
