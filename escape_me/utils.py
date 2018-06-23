import socket
import subprocess


def get_ip_address():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('1.1.1.1', 53))
            return s.getsockname()[0]
    except Exception:
        return None


def refresh_player_view():
    """Sends refresh key to the browser running on RaspberryPi

    Send key combination ctrl+F5, refresh ignoring cache.
    Assumes the browser window is the active windows (as it should be
    on kiosk mode)
    If xdotool is not installed, does nothing.
    """
    ret = subprocess.run(["/usr/bin/which", "xdotool"], stdout=subprocess.PIPE)
    if ret.returncode == 0:
        xdotool = ret.stdout.decode().strip()
        subprocess.run([xdotool, 'key', 'ctrl+F5'], env={'DISPLAY': ':0'})
    else:
        print("No xdotool")
