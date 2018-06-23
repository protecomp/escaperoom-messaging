from flask import render_template
from .. import socketio
from . import main

from logging import getLogger
logger = getLogger(__name__)


@main.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


@main.route('/player')
def player_view():
    return render_template('player.html', async_mode=socketio.async_mode)
