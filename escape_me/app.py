from flask import Flask, render_template
from flask_socketio import SocketIO, emit, disconnect

from logging import getLogger

logger = getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = '12345678'
socketio = SocketIO(app, async_mode="eventlet")


@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


@app.route('/player')
def player_view():
    return render_template('player.html', async_mode=socketio.async_mode)


@socketio.on('hint_request')
def hint_request():
    emit('hint_request')


@socketio.on('hint_available')
def hint_available():
    emit('hint_available')


@socketio.on('my_message')
def send_hint(message):
    emit('set_message', {'data': message['data']}, broadcast=True)
    emit('my_response', {'data': message['data']})


@socketio.on('connect')
def client_connected():
    print("Client connected")


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


@socketio.on('disconnect_request')
def disconnect_request():
    emit('my_response', {'data': 'Disconnected!'})
    disconnect()


@socketio.on('my_event')
def respond(message):
    emit('my_response', {'data': message['data']})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')
