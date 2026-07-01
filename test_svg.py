import sys
import xml.etree.ElementTree as ET

def parse_svg():
    tree = ET.parse('frontend/public/spray.svg')
    root = tree.getroot()
    print("SVG attributes:", root.attrib)
    for child in root:
        print("Child:", child.tag, child.attrib)

parse_svg()
