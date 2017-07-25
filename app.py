from flask import Flask
app = Flask(__name__)

from flask import render_template
import credentials

import requests
import urllib

from urllib.error import HTTPError
from urllib.parse import quote
from urllib.parse import urlencode


# Fill in your Yelp OAuth credentials here.
CLIENT_ID = credentials.CLIENT_ID
CLIENT_SECRET = credentials.CLIENT_SECRET

# API Constants. You shouldn't have to change these.
API_HOST = 'https://api.yelp.com'
TOKEN_PATH = '/oauth2/token'
GRANT_TYPE = 'client_credentials'


def obtain_bearer_token(host, path):
    """Given a bearer token, send a GET request to the API.

    Args:
        host (str): The domain host of the API.
        path (str): The path of the API after the domain.
        url_params (dict): An optional set of query parameters in the request.

    Returns:
        str: OAuth bearer token, obtained using client_id and client_secret.

    Raises:
        HTTPError: An error occurs from the HTTP request.
    """
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    assert CLIENT_ID, "Please supply your client_id."
    assert CLIENT_SECRET, "Please supply your client_secret."
    data = urlencode({
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': GRANT_TYPE,
    })
    headers = {
        'content-type': 'application/x-www-form-urlencoded',
    }
    response = requests.request('POST', url, data=data, headers=headers)
    bearer_token = response.json()['access_token']
    return bearer_token

@app.route("/")
def showMap():
    return render_template("index.html")

@app.route("/test")
def test():
    bearer_token = obtain_bearer_token(API_HOST, TOKEN_PATH)
    print('bearer_token')
    print(bearer_token)
    return bearer_token

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
