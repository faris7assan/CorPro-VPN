# Render Deployment - Password Reset HTML

This is a standalone deployment for the password-reset.html file.

## Quick Deploy to Render

1. **Create a new Render Static Site**
   - Go to https://render.com
   - Click "New +" → "Static Site"
   - Connect your repository
   - Build Command: (leave empty, it's just static files)
   - Publish Directory: `.`

2. **Or use this simple Node server for password-reset.html**:

```javascript
// server.js
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(__dirname));

app.get("/password-reset.html", (req, res) => {
  res.sendFile(path.join(__dirname, "password-reset.html"));
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

3. **Deploy Instructions**:
   - Upload `password-reset.html` to Render
   - Note your Render URL (e.g., `https://corpo-vpn-recovery.onrender.com`)
   - Update Supabase recovery email redirect to your Render URL

## Files Needed for Render Deployment

- `password-reset.html` - The HTML recovery page
- `package.json` (if using Node server)
- `render.yaml` (optional, for configuration)
