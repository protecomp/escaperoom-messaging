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

Set flask environment variables and start app in development mode:

```
FLASK_ENV=development
FLASK_APP=escape_me

flask init-db
flask run -h 0.0.0.0 -p 5000
```

In production:

```
env/bin/python run.py
```
