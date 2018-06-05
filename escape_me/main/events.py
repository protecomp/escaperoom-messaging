import json
from flask_socketio import emit, disconnect
from .. import socketio
from ..db import get_db

from logging import getLogger
logger = getLogger(__name__)


class Hints():
    def insert(self, body):
        db = get_db()
        db.execute(
            'INSERT INTO hint (body) VALUES (?)',
            (body, )
        )
        db.commit()

    def update(self, row_id, body):
        db = get_db()
        db.execute(
            'UPDATE hint SET body = (?) WHERE id = (?)',
            (body, row_id)
        )
        db.commit()

    def delete(self, row_id_list):
        to_delete_str = ", ".join(row_id_list)
        db = get_db()
        db.execute(
            'DELETE FROM hint WHERE id IN ( {} )'.format(to_delete_str)
        )
        db.commit()

    def get_all(self):
        db = get_db()
        return [
            {'body': row['body'], 'id': row['id']}
            for row in db.execute('SELECT id, body FROM hint').fetchall()
        ]
hints = Hints()


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
    emit(
        'my_response',
        {'event': 'database', 'data': {'all_hints': hints.get_all(), 'state': state.get_all()}},
        broadcast=True
    )


@socketio.on('hint_request')
def hint_request():
    state.hint_requested = True
    emit('my_response', {'event': 'hint request', 'data': "Hint requested by player"},
         broadcast=True)


@socketio.on('hint_available')
def hint_available(payload):
    state.hint_available = payload.get('hint_available', True)
    state.hint_body = payload.get('hint_body', '')
    broadcast_database()


@socketio.on('hint_save')
def hint_save(message):
    if 'row_id' in message:
        hints.update(message['row_id'], message['data'])
    else:
        hints.insert(message['data'])
    broadcast_database()


@socketio.on('hint_delete')
def hint_delete(to_delete):
    print("DELETING: %s" % to_delete)
    hints.delete(to_delete['data'])
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
