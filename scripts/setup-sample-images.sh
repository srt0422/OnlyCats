#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Download sample cat images from placekitten.com
for i in {1..3}; do
  curl "https://placekitten.com/800/600" -o "public/placeholder-cat-$i.jpg"
done

for i in {1..3}; do
  curl "https://placekitten.com/800/600" -o "public/placeholder-winner-$i.jpg"
done

echo "Sample images downloaded successfully!" 