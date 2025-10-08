# BigQuery Setup Guide

## Overview
The Quality Metrics feature requires BigQuery credentials to access the `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis` table.

## Current Status
⚠️ **BigQuery credentials are NOT configured** - Quality metrics will show "0" until this is set up.

## What's Affected
- **Overall Quality Score** card (shows 0/100)
- **Quality by Category** radar chart (empty)
- All other metrics work normally (they use PostgreSQL)

## Setup Steps

### Option 1: For Local Development

1. **Obtain the BigQuery service account JSON file** from:
   - Google Cloud Console → IAM & Admin → Service Accounts
   - Project: `pursuit-ops`
   - Service account should have BigQuery Data Viewer role

2. **Save the JSON file** to:
   ```
   /Users/greghogue/Curricullum/segundo-query-ai/docs/pursuit-ops-49ed5477c1e2.json
   ```

3. **Verify `.env` has this line**:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/Users/greghogue/Curricullum/segundo-query-ai/docs/pursuit-ops-49ed5477c1e2.json
   ```

4. **Add to `.gitignore`** (already done):
   ```
   *credentials*.json
   ```

### Option 2: For Vercel Deployment

1. **Convert JSON to Base64**:
   ```bash
   cat docs/pursuit-ops-49ed5477c1e2.json | base64 > bigquery-creds-base64.txt
   ```

2. **Add to Vercel Environment Variables**:
   - Go to: https://vercel.com/gregs-projects-61e51c01/segundo-query-ai/settings/environment-variables
   - Add new variable:
     - **Name**: `GOOGLE_CREDENTIALS_BASE64`
     - **Value**: Paste the base64-encoded string from step 1
     - **Environments**: ✅ Production, ✅ Preview, ✅ Development

3. **Redeploy** after adding the environment variable

## How It Works

The `lib/services/bigquery.ts` file checks for credentials in this order:

1. **First**: `GOOGLE_CREDENTIALS_BASE64` (base64-encoded JSON)
   - Used by Vercel and production environments

2. **Second**: `GOOGLE_APPLICATION_CREDENTIALS` (file path)
   - Used for local development

3. **If neither exists**: Throws error and quality metrics show as unavailable

## Testing the Connection

### Local Test
```bash
# After setting up credentials locally
npm run dev

# Open browser to http://localhost:3000/metrics
# Quality metrics should show real data
```

### Vercel Test
```bash
# After adding GOOGLE_CREDENTIALS_BASE64 to Vercel
npx vercel --prod

# Check the deployed site
# Quality metrics should populate with real scores
```

## Troubleshooting

### "BigQuery credentials not configured" Error
- **Cause**: Neither environment variable is set
- **Fix**: Follow Setup Steps above

### "Permission denied" Error
- **Cause**: Service account lacks BigQuery Data Viewer role
- **Fix**: Add role in Google Cloud Console IAM

### Quality metrics timeout
- **Cause**: BigQuery query taking too long
- **Fix**: Already handled - 10 second timeout with graceful fallback

## Data Structure

### Tables Used
- `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis`
  - Contains assessment scores per builder
  - Includes rubric breakdowns in `type_specific_data` JSON field

### Queries Run
1. **Overall Score**: `AVG(overall_score)` across all assessments
2. **Category Breakdown**: Parses `type_specific_data` for rubric scores
3. **Total Assessments**: `COUNT(*)` per cohort

## Security Notes

⚠️ **NEVER commit the JSON credentials file to git**
- Already in `.gitignore` as `*credentials*.json`
- GitHub will block pushes if credentials are detected

✅ **Safe approaches**:
- Local development: File path in `.env.local` (not committed)
- Vercel: Base64 environment variable (stored securely in Vercel)

## Contact

For access to the BigQuery credentials:
- Contact: Pursuit Ops team
- Project: `pursuit-ops`
- Dataset: `pilot_agent_public`
