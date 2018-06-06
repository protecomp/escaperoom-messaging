from flask_socketio import emit, disconnect
from .. import socketio
from ..db import get_db
from .models import State, Hints

from logging import getLogger
logger = getLogger(__name__)

state = State()
hints = Hints()


def broadcast_database():
    emit('database', {'all_hints': hints.get_all(), 'state': state.get_all()},
         broadcast=True)


@socketio.on('hint_request')
def hint_request():
    state.hint_requested = True
    emit('hint_request', broadcast=True)
    broadcast_database()

    if (state.hint_available and state.hint_body != ""):
        send_hint({'hint_body': state.hint_body})


@socketio.on('hint_available')
def hint_available(payload):
    state.hint_available = payload.get('hint_available', True)
    state.hint_body = payload.get('hint_body', '')
    broadcast_database()

    if (state.hint_requested):
        send_hint({'hint_body': state.hint_body})


@socketio.on('hint_save')
def hint_save(payload):
    if 'row_id' in payload:
        hints.update(payload['row_id'], payload['hint_body'])
    else:
        hints.insert(payload['hint_body'])
    broadcast_database()


@socketio.on('hint_delete')
def hint_delete(to_delete):
    print("DELETING: %s" % to_delete)
    hints.delete(to_delete['data'])
    broadcast_database()


@socketio.on('hint_send')
def send_hint(payload):
    state.hint_requested = False
    state.hint_available = False
    state.hint_body = ""
    emit('hint_send', {'hint_body': payload['hint_body']}, broadcast=True)


@socketio.on('connect')
def client_connected():
    print("Client connected")
    broadcast_database()


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


@socketio.on('disconnect_request')
def disconnect_request():
    emit('disconnected')
    disconnect()


@socketio.on('ping')
def respond_ping():
    emit('pong')


@socketio.on('player_ping')
def broadcast_ping():
    emit('player_ping', broadcast=True)


@socketio.on('player_pong')
def broadcast_pong():
    emit('player_pong', broadcast=True)
