# Google OAuth Setup Guide

To enable Google sign-in for EasyPDF Tools, follow these steps:

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required app information
   - Add your email address under "Test users"
6. For the OAuth client ID:
   - Application type: "Web application"
   - Name: "EasyPDF Tools"
   - Authorized redirect URIs: Add `http://localhost:3000/api/auth/callback/google`
7. Click "Create"

## 2. Update Environment Variables

Copy the Client ID and Client Secret from the Google Cloud Console and update your `.env` file:

```env
DATABASE_URL=file:/home/z/my-project/db/custom.db

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-secret-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## 3. Generate NEXTAUTH_SECRET

Generate a secure secret for NextAuth:

```bash
# In your terminal
openssl rand -base64 32
```

Or use an online generator and paste the result as the `NEXTAUTH_SECRET` value.

## 4. Restart the Development Server

After updating the environment variables, restart your development server:

```bash
npm run dev
```

## 5. Test Google Sign-in

1. Navigate to `http://localhost:3000`
2. Click "Get Started" or "Sign In"
3. Click "Sign in with Google"
4. Complete the Google authentication flow
5. You should be redirected back to the app and signed in

## Troubleshooting

### Google Sign-in Button Not Showing
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are properly set in `.env`
- Check that the values don't have extra spaces or quotes
- Restart the development server after making changes

### "redirect_uri_mismatch" Error
- Ensure the authorized redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check for trailing slashes or missing parts

### "access_denied" Error
- Make sure your Google account is added as a test user in the OAuth consent screen
- Verify the OAuth consent screen is properly configured

### NextAuth Warnings
- If you see warnings about NEXTAUTH_URL or NEXTAUTH_SECRET, make sure both are properly set
- The NEXTAUTH_URL should match your development server URL

## Production Deployment

When deploying to production:

1. Update the authorized redirect URIs in Google Cloud Console to include your production URL:
   - `https://yourdomain.com/api/auth/callback/google`
   
2. Update the NEXTAUTH_URL in your production environment variables:
   - `NEXTAUTH_URL=https://yourdomain.com`

3. Make sure your production environment variables are properly set

## Security Notes

- Never commit your `.env` file to version control
- Keep your client secret secure and never share it publicly
- Regularly rotate your OAuth credentials for better security
- Monitor your OAuth usage in the Google Cloud Console