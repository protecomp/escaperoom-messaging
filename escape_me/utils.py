import socket


def get_ip_address():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('1.1.1.1', 53))
            return s.getsockname()[0]
    except Exception:
        return None
