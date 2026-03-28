# Supabase Email Templates

Paste these into your Supabase dashboard at:
**Authentication > Email Templates**

## OTP / Magic Link Template

**Template type:** `Magic Link` (also used for OTP verification)

**Subject:**
```
Tu codigo de verificacion — {{ .Token }}
```

**Body:** Copy the contents of `otp-verification.html`

### Available variables:
- `{{ .Token }}` — The 6-digit OTP code
- `{{ .SiteURL }}` — Your Supabase project URL
- `{{ .ConfirmationURL }}` — Magic link URL (if using link-based auth)
- `{{ .Email }}` — The recipient's email

### Steps to configure:
1. Go to Supabase Dashboard > Authentication > Email Templates
2. Select the **Magic Link** template
3. Replace the subject line with the one above
4. Replace the HTML body with the contents of `otp-verification.html`
5. Click **Save**

### Notes:
- The template uses inline CSS for maximum email client compatibility
- Colors match the PCMS primary palette (#0091C3 teal)
- The OTP code is displayed in a large monospace font with wide letter-spacing
- Template is in Spanish to match the app's primary language
