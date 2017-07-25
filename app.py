from flask import Flask
app = Flask(__name__)

from flask import render_template

import yelp

@app.route("/")
def showMap():
    return render_template("index.html")

@app.route("/test")
def test():
    #bearer_token = obtain_bearer_token(API_HOST, TOKEN_PATH)
    #print('bearer_token')
    #print(bearer_token)

    yelp.query_api('lunch', 'San Francisco, CA')

    return "test"

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
