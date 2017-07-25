from flask import Flask
app = Flask(__name__)

from flask import render_template, request, jsonify
from fastkml import kml

import yelp

@app.route("/")
def showMap():
    with open('regional-chinese-sf-bay-area.kml') as f:
        doc = f.read()
        k = kml.KML()
        k.from_string(doc)
        print(len(k._features))
        print(doc)
    return render_template("index.html")

@app.route("/business")
def getBusinessInfo():
    name = request.args['name']
    latitude = request.args['latitude']
    longitude = request.args['longitude']
    json_response = yelp.query_api(name, latitude, longitude)

    return jsonify(json_response)

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
