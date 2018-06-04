import React, { Component } from 'react';
import socketIOClient from 'socket.io-client'

class Player extends Component {
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
      <div style={{ textAlign: "center" }}>
        <button onClick={() => this.send()}>Change Color (Player)</button>
      </div>
    )
  }
}
export default Player;
