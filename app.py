from flask import Flask
app = Flask(__name__)

from flask import render_template, request, jsonify
from pykml import parser

import yelp

KML_FILE = 'regional-chinese-sf-bay-area.kml'

def get_locations(kml_path):
    locations = []
    with open(KML_FILE) as f:
        root = parser.parse(f).getroot()
        folder = root.Document.Folder

        for placemark in folder.Placemark:
            location = {}
            location['name'] = unicode(placemark.name.text)

            coordinates = str(placemark.Point.coordinates).strip().split(',')

            location['lng'] = coordinates[0]
            location['lat'] = coordinates[1]

            try:
                location['regionName'] = placemark.description
            except AttributeError:
                # Not all region names are present in the KML.
                location['regionName'] = 'None'

            locations.append(location)

    return locations

@app.route("/")
def showMap():
    locations = get_locations('regional-chinese-sf-bay-area.kml')
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
