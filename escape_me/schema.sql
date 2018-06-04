DROP TABLE IF EXISTS hint;
DROP TABLE IF EXISTS room;

CREATE TABLE hint (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  keywords TEXT,
  body TEXT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES room (id)
);

CREATE TABLE room (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  keywords TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

