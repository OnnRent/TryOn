#!/bin/bash

# Setup Vercel Environment Variables Helper Script
# This script helps you prepare environment variables for Vercel deployment

echo "🚀 Vercel Environment Variables Setup Helper"
echo "=============================================="
echo ""

# Check if service account file exists
if [ ! -f "service-account-file.json" ]; then
    echo "❌ Error: service-account-file.json not found in current directory"
    echo "Please run this script from the Backend directory"
    exit 1
fi

echo "✅ Found service-account-file.json"
echo ""

# Extract project ID
PROJECT_ID=$(cat service-account-file.json | grep -o '"project_id": "[^"]*' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Could not extract project_id from service-account-file.json"
    exit 1
fi

echo "📋 Extracted Information:"
echo "========================"
echo "GCP_PROJECT_ID: $PROJECT_ID"
echo ""

# Convert JSON to single line
echo "📝 Converting service account JSON to single line..."
SINGLE_LINE_JSON=$(cat service-account-file.json | tr -d '\n' | tr -d '\r')

# Save to temporary file
echo "$SINGLE_LINE_JSON" > /tmp/gcp-credentials-single-line.txt

echo "✅ Single-line JSON saved to: /tmp/gcp-credentials-single-line.txt"
echo ""

# Copy to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    echo "$SINGLE_LINE_JSON" | pbcopy
    echo "✅ Single-line JSON copied to clipboard!"
    echo ""
fi

echo "📋 Environment Variables to Add to Vercel:"
echo "=========================================="
echo ""
echo "1. GOOGLE_APPLICATION_CREDENTIALS_JSON"
echo "   Value: (copied to clipboard - paste it)"
if ! command -v pbcopy &> /dev/null; then
    echo "   Or get it from: /tmp/gcp-credentials-single-line.txt"
fi
echo ""
echo "2. GCP_PROJECT_ID"
echo "   Value: $PROJECT_ID"
echo ""
echo "3. GOOGLE_CLOUD_LOCATION"
echo "   Value: us-central1"
echo ""

echo "🔗 Add these variables at:"
echo "   https://vercel.com/vansh-karnwals-projects/try-on/settings/environment-variables"
echo ""

echo "✅ Make sure to select all environments (Production, Preview, Development)"
echo ""

echo "🚀 After adding variables, redeploy your project!"
echo ""

# Offer to open Vercel settings
if command -v open &> /dev/null; then
    read -p "Open Vercel settings in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://vercel.com/vansh-karnwals-projects/try-on/settings/environment-variables"
    fi
fi

