from flask_socketio import emit
from .. import socketio
from ..utils import get_ip_address, refresh_player_view, play_sound
from .models import State, Hints
from . import main

from logging import getLogger
logger = getLogger(__name__)

state = State()
hints = Hints()


def broadcast_database():
    emit('database', {'all_hints': hints.get_all(), 'state': state.get_all()},
         broadcast=True)


@main.before_app_first_request
def reset_state():
    state.reset()


@socketio.on('hint_request')
def hint_request():
    if (state.hint_available and state.hint_available_body != ""):
        hint_send({'hint_body': state.hint_available_body})
    else:
        state.hint_requested = True
        emit('hint_request', broadcast=True)
    broadcast_database()


@socketio.on('hint_available')
def hint_available(payload):
    state.hint_available = payload.get('hint_available', True)
    state.hint_available_body = payload.get('hint_body', '')
    if state.hint_available and state.hint_available_body:
        play_sound()
    broadcast_database()

    if (state.hint_requested):
        hint_send({'hint_body': state.hint_available_body})


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
def hint_send(payload):
    state.hint_requested = False
    state.hint_available = False
    state.hint_available_body = ""
    state.hint_body = payload['hint_body']
    emit('hint_send', {'hint_body': payload['hint_body']}, broadcast=True)
    broadcast_database()


@socketio.on('hint_clear')
def hint_clear():
    hint_send({'hint_body': ''})


@socketio.on('connect')
def client_connected():
    ip = get_ip_address()
    state.ip_address = ip
    broadcast_database()


@socketio.on('host_connected')
def host_connected():
    state.host_was_found = True
    broadcast_database()


@socketio.on('ping')
def respond_ping():
    emit('pong')


@socketio.on('player_ping')
def broadcast_ping():
    emit('player_ping', broadcast=True)


@socketio.on('player_pong')
def broadcast_pong():
    emit('player_pong', broadcast=True)


@socketio.on('refresh_player')
def refresh_player():
    refresh_player_view()
