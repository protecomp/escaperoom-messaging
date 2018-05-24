# escaperoom-messaging
RaspberryPi based messaging sytem for Escape rooms

## Getting started

Install Python 3

Install and create virtualenv:

```
pip3 install virtualenv
virtualenv -p python3 env
. env/bin/activate

# Check python version
python --version
pip install -r requirements.txt
```

Start app in development mode:

```
FLASK_ENV=development python escape_me/app.py
```