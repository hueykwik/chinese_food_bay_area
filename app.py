from flask import Flask
app = Flask(__name__)

from flask import render_template, request, jsonify

import yelp

locations = [
    {'name': 'Gou Bu Li', 'lat': 37.961543, 'lng': -122.325498},
    {'name': 'Hometown Noodle', 'lat': 37.261173, 'lng': -121.932017},
    {'name': 'T4 Livermore', 'lat': 37.680343, 'lng': -121.747897},
    {'name': 'Sichuan Table', 'lat': 37.775155, 'lng': -122.50606},
    {'name': 'Tashi delek', 'lat': 37.919973, 'lng': -122.314227}
];

@app.route("/")
def showMap():
    with open('regional-chinese-sf-bay-area.kml') as f:
        doc = f.read()
        return render_template("index.html", locations=locations)

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
