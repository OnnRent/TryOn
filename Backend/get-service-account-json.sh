#!/bin/bash
# This script outputs your service account JSON in a single line
# Use this to copy/paste into Railway environment variables

echo "Copy the output below and paste it into Railway as GOOGLE_APPLICATION_CREDENTIALS_JSON:"
echo ""
cat service-account-file.json | tr -d '\n'
echo ""
echo ""
echo "Done! Copy everything between the lines above."

