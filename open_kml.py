"""
Experiment with opening the chinese-food-kml without having to launch a webapp.
"""
from pykml import parser

with open('regional-chinese-sf-bay-area.kml') as f:
    root = parser.parse(f).getroot()

    folder = root.Document.Folder

    for placemark in folder.Placemark:
        print unicode(placemark.name)
        coordinates = unicode(placemark.Point.coordinates).strip().split(',')
        print coordinates

    print(root)
    print(root.Document)
