#!/bin/bash

# Create output directory
OUTPUT_DIR="ios/Grace/Images.xcassets/AppIcon.appiconset"
INPUT_SVG="src/assets/ios_icon.svg"

# Generate icons at required sizes
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-20@2x.png" -w 40 -h 40
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-20@3x.png" -w 60 -h 60
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-29@2x.png" -w 58 -h 58
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-29@3x.png" -w 87 -h 87
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-40@2x.png" -w 80 -h 80
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-40@3x.png" -w 120 -h 120
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-60@2x.png" -w 120 -h 120
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-60@3x.png" -w 180 -h 180
sharp -i $INPUT_SVG -o "$OUTPUT_DIR/icon-1024.png" -w 1024 -h 1024

echo "iOS icons generated successfully!" 
