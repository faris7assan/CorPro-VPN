# Corpo VPN - Password Recovery Setup Guide

## 🔐 Complete Password Recovery Flow

### User Flow:

1. **Desktop App** → User forgets password → Settings page → Click "📧 Send Reset Email"
2. **Email Sent** → Supabase sends recovery email with secure token
3. **HTML Page** → User clicks link → Opens `password-reset.html` with recovery token
4. **Password Reset** → User enters new password (validates regex: 8+ chars, upper, lower, special)
5. **Success** → Form disappears, success message displays, auto-redirects to login
6. **Login** → User signs in with new password (updated in Supabase & database)

---

## 📁 Files Created/Modified

### Frontend

- **`grad project draft front/public/password-reset.html`** (NEW)
  - Standalone HTML page for password recovery
  - Validates recovery token from Supabase email link
  - Secures access via `code` parameter (recovery token)
  - Makes API call to backend to update password
  - Shows success/error states

- **`grad project draft front/src/pages/Settings.jsx`** (MODIFIED)
  - Added "Send Reset Email" button
  - Updated redirect URL to point to HTML page
  - Added success state feedback

- **`grad project draft front/src/pages/PasswordRecovery.jsx`** (KEPT - for React SPA)
  - Alternative React-based recovery page (if user accesses from web app)

### Backend

- **`grad project draft back/src/auth/auth.controller.ts`** (MODIFIED)
  - Added `POST /api/auth/update-password` endpoint

- **`grad project draft back/src/auth/auth.service.ts`** (MODIFIED)
  - Added `updatePasswordViaRecovery()` method
  - Logs password updates for audit trail

---

## 🔒 Security Features

### Token Validation

- **Only valid recovery tokens** can access the page
- Token is extracted from URL `code` parameter
- Supabase `exchangeCodeForSession()` validates the token
- Invalid/expired tokens show error page with no form access

### Password Encryption

- **Regex Validation**: `^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})`
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one special character (!@#$%^&\*)

### Multi-Layer Update

- **Frontend**: Updates password via Supabase Auth (`supabase.auth.updateUser()`)
- **Backend**: API endpoint logs the update and confirms in database
- **Database**: `updated_at` timestamp records when password was changed

### Email Security

- **Recovery link** includes recovery token (secure, one-time use)
- **No password** in email (Supabase best practice)
- **Expiration**: Recovery tokens expire after set time (configurable in Supabase)
- **User verification**: Only person with email access can reset password

---

## 🚀 Deployment URLs

### HTML Page Deployment

- **Development**: `http://localhost:5173/password-reset.html`
- **Production**: `https://corpo-vpn.vercel.app/password-reset.html`
- **Render Option**: Can deploy separately to custom domain (configured in Supabase recovery email settings)

### API Endpoint

- **Backend URL**: `https://corpo-vpn-backend.onrender.com/api/auth/update-password`
- **Request Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "NewPassword123!"
  }
  ```

---

## 🔧 Configuration

### Supabase Email Recovery

1. Go to **Supabase Dashboard** → Project Settings → Auth
2. Set **Password Recovery Email Template** redirect to:
   ```
   https://corpo-vpn.vercel.app/password-reset.html
   ```
3. Supabase automatically appends `?code=RECOVERY_TOKEN` to the URL

### Password Regex

Currently set to: `^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})`

To modify:

- **Frontend**: Edit `validatePassword()` in `password-reset.html` (line ~28)
- **Backend**: Edit `validatePassword()` in `Settings.jsx` (line ~106)
- Keep both in sync!

---

## 📋 Testing Checklist

- [ ] Desktop app shows "Send Reset Email" button
- [ ] Email received with recovery link
- [ ] Recovery link opens HTML page with token validation
- [ ] Invalid/expired token shows error page
- [ ] Password form shows with placeholder text
- [ ] Password validation rejects weak passwords
- [ ] Success message displays after update
- [ ] Auto-redirect to login works
- [ ] New password works for sign in
- [ ] Old password no longer works

---

## 🐛 Troubleshooting

### Recovery email not arriving

- Check Supabase email settings in project
- Verify email template is configured with correct redirect URL
- Check user's spam/junk folder
- Ensure user exists in database

### Invalid token error

- Token may be expired (Supabase default: 24 hours)
- User should request a new recovery email
- Check that `code` parameter is in URL

### Password update fails

- Check backend API is running: `https://corpo-vpn-backend.onrender.com/api/auth/update-password`
- Verify password meets regex requirements
- Check Supabase service role key is configured

### Still can't sign in with new password

- Wait a few seconds for database to sync
- Try requesting a new recovery email
- Contact admin for manual database verification

---

## 📊 Database Schema

### auth_users table (updated_at field)

```sql
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- When password is updated via recovery:
UPDATE auth_users SET updated_at=NOW() WHERE email=$1;
```

---

## 📝 API Documentation

### POST `/api/auth/update-password`

Updates password after recovery verification

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | ✅ | User's email address |
| password | string | ✅ | New password (must meet regex) |

**Response:**

```json
{
  "success": true,
  "message": "Password updated successfully. Please sign in with your new password."
}
```

**Error Response:**

```json
{
  "statusCode": 400,
  "message": "User not found"
}
```

---

## 🎯 Key Points

✅ **Secure**: Only user with email access can reset password
✅ **Token-based**: Recovery links are one-time use with expiration
✅ **Regex validated**: Enforces strong password requirements
✅ **Multi-layer**: Updates both Supabase Auth and database
✅ **User-friendly**: Success feedback and auto-redirect
✅ **Mobile-ready**: Responsive HTML page works on all devices
✅ **Standalone**: Works without React app dependencies

---

## 🔄 Password Flow Diagram

```
Desktop App (Settings)
      ↓
[Send Reset Email button]
      ↓
Supabase Recovery Email
      ↓
User clicks recovery link
      ↓
password-reset.html page loads
      ↓
[Verify recovery token]
      ↓
Valid? → Show password form
Invalid? → Show error page
      ↓
User enters new password
      ↓
[Validate regex]
      ↓
Valid? → Submit to API
Invalid? → Show error message
      ↓
API updates Supabase + Database
      ↓
Success message + Auto-redirect
      ↓
User signs in with new password ✅
```

---

Generated: 2026-05-08
Updated for: Corpo VPN v1.0.0
