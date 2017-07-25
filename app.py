from flask import Flask
app = Flask(__name__)

from flask import render_template

@app.route("/")
def showMap():
    return render_template("index.html")

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
