import json

from ..db import get_db


class DB_Base():
    def db_exec(self, query, args=()):
        db = get_db()
        db.execute(query, args)
        db.commit()

    def db_query(self, query, args=(), one=False):
        cur = get_db().execute(query, args)
        rv = cur.fetchall()
        cur.close()
        return (rv[0] if rv else None) if one else rv


class Hints(DB_Base):
    def insert(self, body):
        self.db_exec(
            'INSERT INTO hint (body) VALUES (?)',
            (body, )
        )

    def update(self, row_id, body):
        self.db_exec(
            'UPDATE hint SET body = (?) WHERE id = (?)',
            (body, row_id)
        )

    def delete(self, row_id_list):
        to_delete_str = ", ".join(row_id_list)
        self.db_exec(
            'DELETE FROM hint WHERE id IN ( {} )'.format(to_delete_str)
        )

    def get_all(self):
        return [
            {'body': row['body'], 'id': row['id']}
            for row in self.db_query('SELECT id, body FROM hint')
        ]


class State(DB_Base):
    def __setattr__(self, key, value):
        value_json = json.dumps(value)
        self.db_exec('INSERT OR REPLACE INTO state (key, value) VALUES (?, ?)', (key, value_json))

    def __getattr__(self, key):
        try:
            return json.loads(self.db_query(
                'SELECT value FROM state WHERE key = "{}"'.format(key),
                one=True
            )['value'])
        except TypeError:  # Value didn't exist
            return None

    def get_all(self):
        ret = {}
        for row in self.db_query('SELECT key, value FROM state'):
            ret[row['key']] = json.loads(row['value'])
        return ret
