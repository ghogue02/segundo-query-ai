# 🔧 Google Cloud SQL - Allow Vercel Access

**Time Required**: 2-3 minutes

---

## 📋 Step-by-Step Instructions

### Step 1: Open Google Cloud Console
1. Go to: **https://console.cloud.google.com/sql/instances**
2. Make sure you're in the correct project

### Step 2: Find Your Database Instance
1. Look for the instance with IP: **34.57.101.141**
2. It should be named something like "segundo-db" or similar
3. Click on the instance name

### Step 3: Go to Connections
1. In the left sidebar, click **"Connections"**
2. Or look for the "Connections" tab at the top

### Step 4: Add Authorized Network
1. Scroll to **"Authorized networks"** section
2. Click **"Add network"** or **"Add a network"**
3. Enter these details:

   **Network Name:** `Vercel`

   **Network IP:** `0.0.0.0/0`

   *(This allows all IPs - easiest for now)*

4. Click **"Done"**
5. Click **"Save"** at the bottom of the page

### Step 5: Wait for Changes to Apply
- Takes about 1-2 minutes
- You'll see "Updating instance..." message

### Step 6: Test
```bash
curl https://segundo-query-jr8lrlxix-gregs-projects-61e51c01.vercel.app/api/health
```

Expected result:
```json
{
  "status": "healthy",
  "database": "connected",
  "claude": "configured"
}
```

---

## 🔐 More Secure Option (Optional)

Instead of `0.0.0.0/0`, add three separate networks for Vercel's specific IPs:

**Network 1:**
- Name: `Vercel-1`
- IP: `76.76.21.0/24`

**Network 2:**
- Name: `Vercel-2`
- IP: `76.76.22.0/24`

**Network 3:**
- Name: `Vercel-3`
- IP: `76.76.23.0/24`

This is more secure but takes a bit longer to set up.

---

## 🎯 Quick Visual Guide

```
Google Cloud Console
└── SQL (left menu)
    └── Instances
        └── [Your Instance: 34.57.101.141]
            └── Connections (tab)
                └── Networking section
                    └── Authorized networks
                        └── [Add network] button
                            ├── Name: Vercel
                            └── Network: 0.0.0.0/0
                                └── [Done] → [Save]
```

---

## ❓ Can't Find Your Instance?

If you don't see the instance at 34.57.101.141:

1. Check you're in the right Google Cloud project
2. Try searching for "segundo-db" in the search bar
3. Or list all instances and look for the IP address

---

## ⚡ After It Works

Once the health check shows "connected", your entire app will be functional:
- ✅ Natural language queries
- ✅ Interactive charts
- ✅ Drill-down panels
- ✅ Builder/task details
- ✅ All 107 tasks tracked
- ✅ All 75 builders accessible

---

## 🚨 Troubleshooting

### If it still doesn't work after 2 minutes:

**Check 1: Is the instance running?**
- Status should be "Running" (green)

**Check 2: Is the IP correct?**
- Public IP should be 34.57.101.141

**Check 3: Did you click Save?**
- Changes don't apply until you click the "Save" button at the bottom

**Check 4: Try restarting the connection**
- Sometimes it helps to wait 5 minutes
- Or try clearing cache: `curl -H "Cache-Control: no-cache" [your-url]/api/health`

---

## 📞 Need Help?

If you get stuck, let me know what you see in the Google Cloud Console and I can guide you through it!

---

**This is the last step - you're almost there!** 🎉
