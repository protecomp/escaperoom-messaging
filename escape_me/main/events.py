import json
from flask_socketio import emit, disconnect
from .. import socketio
from ..db import get_db

from logging import getLogger
logger = getLogger(__name__)


class State():
    def __setattr__(self, key, value):
        value_json = json.dumps(value)
        db = get_db()
        db.execute('INSERT OR REPLACE INTO state (key, value) VALUES (?, ?)', (key, value_json))
        db.commit()

    def __getattr__(self, key):
        db = get_db()
        return json.loads(db.execute(
            'SELECT value FROM state WHERE key = "{}"'.format(key)
        ).fetchone().get('value', 'null'))

    def get_all(self):
        db = get_db()
        ret = {}
        for row in db.execute('SELECT key, value FROM state').fetchall():
            ret[row['key']] = row['value']
        return ret

state = State()


def broadcast_database():
    db = get_db()
    all_hints = [
        {'body': row['body'], 'id': row['id']}
        for row in db.execute('SELECT id, body FROM hint').fetchall()
    ]
    emit(
        'my_response',
        {'event': 'database', 'data': {'all_hints': all_hints, 'state': state.get_all()}},
        broadcast=True
    )


@socketio.on('hint_request')
def hint_request():
    state.hint_requested = True
    emit('my_response', {'event': 'hint request', 'data': "Hint requested by player"},
         broadcast=True)


@socketio.on('hint_available')
def hint_available(payload):
    available = payload.get('data', True)
    emit('my_response', {'event': 'hint available', 'data': available},
         broadcast=True)


@socketio.on('hint_save')
def hint_save(message):
    db = get_db()
    if 'row_id' in message:
        db.execute(
            'UPDATE hint SET body = (?) WHERE id = (?)',
            (message['data'], message['row_id'])
        )
    else:
        db.execute(
            'INSERT INTO hint (body) VALUES (?)',
            (message['data'], )
        )
    db.commit()
    broadcast_database()


@socketio.on('hint_delete')
def hint_delete(to_delete):
    to_delete_str = ", ".join(to_delete['data'])
    print("DELETING: %s" % to_delete_str)
    db = get_db()
    db.execute(
        'DELETE FROM hint WHERE id IN ( {} )'.format(to_delete_str)
    )
    db.commit()
    broadcast_database()


@socketio.on('my_message')
def send_hint(message):
    state.hint_requested = False
    emit('set_message', {'data': message['data']}, broadcast=True)
    emit('my_response', {'event': 'hint set', 'data': message['data']})


@socketio.on('connect')
def client_connected():
    print("Client connected")
    broadcast_database()


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


@socketio.on('disconnect_request')
def disconnect_request():
    emit('my_response', {'event': 'connection', 'data': 'Disconnected!'})
    disconnect()


@socketio.on('my_event')
def respond(message):
    emit('my_response', {'event': 'connection', 'data': message['data']}, broadcast=True)


@socketio.on('ping')
def respond_ping():
    emit('pong')


@socketio.on('player_ping')
def broadcast_ping():
    emit('player_ping', broadcast=True)


@socketio.on('player_pong')
def broadcast_pong():
    emit('player_pong', broadcast=True)
