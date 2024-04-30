#!/bin/zsh

version=$1

# Check if version is provided
if [[ -z "$version" ]]; then
    echo "Please provide a version."
    exit 1
fi

# Clean build directory
rm -rf build

# Create build directory if it doesn't exist
mkdir -p build
echo "Created build directory"

cd source

# Loop over directories
for dir in */ ; do
    # Remove trailing slash from directory name
    cd "$dir"
    dir=${dir%/}

    # Zip contents of directory
    echo "Zipping contents of directory: $dir"
    zip -r "../../build/${dir}.c3addon" .
    cd ..
done

# Change to build directory
cd ../build
echo "Changed to build directory"

# Zip all files into ProUI_v<version>.zip
echo "Zipping all files into ProUI_v${version}.zip"
zip -r "ProUI_v${version}.zip" *

mv "ProUI_v${version}.zip" "../dist-collection/ProUI_v${version}.zip"

# Move back to the original directory
cd ..
echo "Moved back to the original directory"