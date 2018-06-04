from flask import Flask
from flask_socketio import SocketIO
socketio = SocketIO()


def create_app(debug=False):
    """Create an application."""
    app = Flask(__name__)
    app.debug = debug
    app.config['SECRET_KEY'] = '12345678'
    app.config['DATABASE'] = 'db.sqlite'

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from . import db
    db.init_app(app)

    socketio.init_app(app)
    return app
