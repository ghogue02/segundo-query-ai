#!/bin/bash

# Automated Vercel Environment Variable Setup
# This script reads from .env.local and adds all variables to Vercel

set -e  # Exit on error

echo "🚀 Vercel Environment Variable Setup"
echo "====================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  echo "   Please ensure .env.local exists in the project root"
  exit 1
fi

# Check if user is logged in to Vercel
echo "Checking Vercel authentication..."
if ! vercel whoami > /dev/null 2>&1; then
  echo "❌ Not logged in to Vercel"
  echo ""
  echo "Please run: vercel login"
  echo "Then run this script again"
  exit 1
fi

VERCEL_USER=$(vercel whoami)
echo "✅ Logged in as: $VERCEL_USER"
echo ""

# Check if project is linked
if [ ! -f .vercel/project.json ]; then
  echo "⚠️  Project not linked to Vercel yet"
  echo ""
  echo "Would you like to:"
  echo "  1) Deploy now (will auto-link)"
  echo "  2) Link existing project"
  echo "  3) Exit and do it manually"
  echo ""
  read -p "Choose (1/2/3): " choice

  case $choice in
    1)
      echo ""
      echo "Deploying to Vercel..."
      vercel
      ;;
    2)
      echo ""
      echo "Linking to existing project..."
      vercel link
      ;;
    3)
      echo "Exiting. Run 'vercel' or 'vercel link' first, then run this script again."
      exit 0
      ;;
    *)
      echo "Invalid choice. Exiting."
      exit 1
      ;;
  esac
fi

echo ""
echo "📝 Reading environment variables from .env.local..."
echo ""

# Parse .env.local and add each variable to Vercel
# We'll add to production, preview, and development

VARS_ADDED=0
VARS_FAILED=0

while IFS='=' read -r key value; do
  # Skip empty lines and comments
  if [[ -z "$key" || "$key" =~ ^#.* ]]; then
    continue
  fi

  # Remove leading/trailing whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)

  # Remove quotes if present
  value="${value%\"}"
  value="${value#\"}"

  echo "Adding: $key"

  # Add to all environments (production, preview, development)
  if echo "$value" | vercel env add "$key" production preview development 2>&1 | grep -q "Success"; then
    echo "  ✅ Added to production, preview, development"
    ((VARS_ADDED++))
  else
    # Try to update if it already exists
    if echo "$value" | vercel env rm "$key" production preview development --yes > /dev/null 2>&1; then
      if echo "$value" | vercel env add "$key" production preview development 2>&1 | grep -q "Success"; then
        echo "  ✅ Updated in production, preview, development"
        ((VARS_ADDED++))
      else
        echo "  ❌ Failed to add"
        ((VARS_FAILED++))
      fi
    else
      echo "  ⚠️  May already exist or failed"
      ((VARS_FAILED++))
    fi
  fi

done < .env.local

echo ""
echo "====================================="
echo "Summary:"
echo "  ✅ Variables added/updated: $VARS_ADDED"
if [ $VARS_FAILED -gt 0 ]; then
  echo "  ⚠️  Variables that may need manual check: $VARS_FAILED"
fi
echo ""

if [ $VARS_ADDED -gt 0 ]; then
  echo "🎉 Environment variables configured!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify at: https://vercel.com/dashboard"
  echo "  2. Redeploy your app: vercel --prod"
  echo ""
else
  echo "⚠️  No variables were added. They may already exist."
  echo "   Check your Vercel dashboard to verify."
  echo ""
fi
