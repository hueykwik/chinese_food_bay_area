from flask import Flask
app = Flask(__name__)

from flask import render_template, request, jsonify
from fastkml import kml

import yelp

locations = [
    {'name': 'Gou Bu Li2', 'lat': 37.961543, 'lng': -122.325498},
    {'name': 'Hometown Noodle2', 'lat': 37.261173, 'lng': -121.932017},
    {'name': 'T4 Livermore2', 'lat': 37.680343, 'lng': -121.747897},
    {'name': 'Sichuan Table2', 'lat': 37.775155, 'lng': -122.50606},
    {'name': 'Tashi delek2', 'lat': 37.919973, 'lng': -122.314227}
];

def convertPlacemarksToLocations(placemarks):
    locations = []

    print(placemarks[0].name)

    for placemark in placemarks[0].features():
        print(placemark.name)

    # for placemark in placemarks:
    #     location = {}
    #     location['name'] = placemark.name

    #     print(placemark.name)
    #     print(placemark.features())
    #     # coordinates = placemark.point.coordinates.split(',')

    #     # location['lng'] = coordinates[0]
    #     # location['lat'] = coordinates[1]

    #     locations.append(location)

    return locations

@app.route("/")
def showMap():
    with open('regional-chinese-sf-bay-area.kml') as f:
        doc = f.read()
        k = kml.KML()
        k.from_string(doc)

        features = list(k.features())
        folder = list(features[0].features())

        locations = convertPlacemarksToLocations(folder)

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
