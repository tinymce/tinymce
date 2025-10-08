#!/usr/bin/env bash
# shellcheck shell=bash
# Quick test runner for rspack configuration tests

set -e

echo "=========================================="
echo "  Rspack Configuration Tests"
echo "=========================================="
echo ""

# Check if we're in the right directory
if ! [ -f "../../rspack.config.js" ]; then
    echo "Error: rspack.config.js not found\!"
    echo "Please run this script from modules/tinymce/test/config/"
    exit 1
fi

# Check if node_modules exists
if ! [ -d "../../../../node_modules" ]; then
    echo "Warning: node_modules not found at repository root"
    echo "Please run 'yarn install' from the repository root first"
    exit 1
fi

# Run the tests
echo "Running tests..."
echo ""

cd ../../../..
npx mocha modules/tinymce/test/config/rspack.config.test.js --reporter spec

echo ""
echo "=========================================="
echo "  Tests completed\!"
echo "=========================================="