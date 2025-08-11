#!/bin/bash

echo "Cleaning iOS project..."
cd ios
rm -rf build
rm -rf Pods
rm -f Podfile.lock

echo "Reinstalling pods..."
pod install

echo "Building iOS project..."
cd ..
npx react-native run-ios

echo "Done!" 
