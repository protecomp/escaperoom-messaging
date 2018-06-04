import React, { Component } from 'react';
import socketIOClient from 'socket.io-client'
import '../css/Player.css';

class Player extends Component {
    constructor() {
        super()

        this.state = {
            endpoint: "http://localhost:5000", // this is where we are connecting to with sockets
            hint_requested: false,
        }
        this.socket = socketIOClient(this.state.endpoint)
    }

    componentDidMount() {
        this.socket.on('my_response', (message) => {
            // setting the color of our button
            console.log(message)
        })
        this.socket.on('connect', (message) => {
            // setting the color of our button
            this.socket.emit('my_event', { data: 'Host connected!' });
            console.log(message)
        })
    }

    request_hint = () => {
        this.setState({hint_requested: true});
        this.socket.emit('hint_request');
        console.log("hint_request")
    }

    // render method that renders in code if the state is updated
    render() {
        return (
            <html id="player_component">
                <head>
                    <title>Room view</title>
                </head>
                <body>
                    <div id="msg"></div>
                    <button id="request_btn" onClick={this.request_hint} disabled={this.state.hint_requested}>Request a hint</button>
                </body>
            </html>
        )
    }
}
export default Player;
