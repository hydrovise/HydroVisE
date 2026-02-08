#!/bin/bash

# Helper script to set up a new config for the React app
# Usage: ./setup-config.sh <config_name>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <config_name>"
    echo "Available configs in examples/:"
    ls -1 ../examples/ | grep -E "^(ex|tut)"
    exit 1
fi

CONFIG_NAME=$1
SOURCE_DIR="../examples/$CONFIG_NAME"
TARGET_DIR="./public/configs/$CONFIG_NAME"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory $SOURCE_DIR does not exist"
    exit 1
fi

echo "Setting up config: $CONFIG_NAME"

# Copy data if it exists
if [ -d "$SOURCE_DIR/data" ]; then
    echo "Copying data from $SOURCE_DIR/data to $TARGET_DIR/data"
    mkdir -p "$TARGET_DIR"
    cp -r "$SOURCE_DIR/data" "$TARGET_DIR/"
fi

# Copy config.json if it exists
if [ -f "$SOURCE_DIR/config.json" ]; then
    echo "Copying and updating config.json"
    cp "$SOURCE_DIR/config.json" "$TARGET_DIR/"
    
    # Update URLs in the config file
    sed -i "s|http://localhost:5173/hydrovise/examples/$CONFIG_NAME/data|http://localhost:5174/configs/$CONFIG_NAME/data|g" "$TARGET_DIR/config.json"
    
    echo "Updated URLs in config.json"
fi

echo "Setup complete! You can now use:"
echo "http://localhost:5174/?config=$CONFIG_NAME"
