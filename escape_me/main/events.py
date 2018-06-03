from flask_socketio import emit, disconnect
from .. import socketio

from logging import getLogger
logger = getLogger(__name__)


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


@socketio.on('ping')
def respond():
    emit('pong')
