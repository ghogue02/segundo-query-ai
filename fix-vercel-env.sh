#!/bin/bash

# Fix Vercel Environment Variables - Remove Whitespace
# Run this script to clean up the database environment variables

set -e

echo "🔧 Fixing Vercel Environment Variables"
echo "======================================="
echo ""
echo "This will remove and re-add database variables to fix whitespace issues."
echo ""

cd /Users/greghogue/Curricullum/segundo-query-ai

# Remove existing variables (one environment at a time)
echo "Removing old variables..."
vercel env rm POSTGRES_HOST production --yes 2>/dev/null || true
vercel env rm POSTGRES_HOST preview --yes 2>/dev/null || true
vercel env rm POSTGRES_HOST development --yes 2>/dev/null || true

vercel env rm POSTGRES_PORT production --yes 2>/dev/null || true
vercel env rm POSTGRES_PORT preview --yes 2>/dev/null || true
vercel env rm POSTGRES_PORT development --yes 2>/dev/null || true

vercel env rm POSTGRES_DB production --yes 2>/dev/null || true
vercel env rm POSTGRES_DB preview --yes 2>/dev/null || true
vercel env rm POSTGRES_DB development --yes 2>/dev/null || true

vercel env rm POSTGRES_USER production --yes 2>/dev/null || true
vercel env rm POSTGRES_USER preview --yes 2>/dev/null || true
vercel env rm POSTGRES_USER development --yes 2>/dev/null || true

vercel env rm POSTGRES_PASSWORD production --yes 2>/dev/null || true
vercel env rm POSTGRES_PASSWORD preview --yes 2>/dev/null || true
vercel env rm POSTGRES_PASSWORD development --yes 2>/dev/null || true

echo "✅ Old variables removed"
echo ""

# Add clean variables
echo "Adding clean variables..."

echo -n "34.57.101.141" | vercel env add POSTGRES_HOST production
echo -n "34.57.101.141" | vercel env add POSTGRES_HOST preview
echo -n "34.57.101.141" | vercel env add POSTGRES_HOST development

echo -n "5432" | vercel env add POSTGRES_PORT production
echo -n "5432" | vercel env add POSTGRES_PORT preview
echo -n "5432" | vercel env add POSTGRES_PORT development

echo -n "segundo-db" | vercel env add POSTGRES_DB production
echo -n "segundo-db" | vercel env add POSTGRES_DB preview
echo -n "segundo-db" | vercel env add POSTGRES_DB development

echo -n "postgres" | vercel env add POSTGRES_USER production
echo -n "postgres" | vercel env add POSTGRES_USER preview
echo -n "postgres" | vercel env add POSTGRES_USER development

echo -n "Pursuit1234!" | vercel env add POSTGRES_PASSWORD production
echo -n "Pursuit1234!" | vercel env add POSTGRES_PASSWORD preview
echo -n "Pursuit1234!" | vercel env add POSTGRES_PASSWORD development

echo ""
echo "✅ Clean variables added"
echo ""
echo "======================================="
echo "🎉 Environment variables fixed!"
echo ""
echo "Next step: Redeploy your app"
echo "  vercel --prod"
echo ""
