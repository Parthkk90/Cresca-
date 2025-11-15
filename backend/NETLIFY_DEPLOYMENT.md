# 🚀 Deploy to Netlify

## Prerequisites
- Netlify account (free): https://app.netlify.com/signup
- Git repository connected to Netlify

## Deployment Steps

### 1. Install Netlify CLI (Optional - for local testing)
```powershell
npm install -g netlify-cli
```

### 2. Test Locally
```powershell
# Install dependencies
npm install

# Test function locally
netlify dev
```

### 3. Deploy to Netlify

#### Option A: Via Netlify Web UI (Recommended)

1. **Connect Repository:**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings:**
   - Build command: (leave empty)
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

3. **Set Environment Variables:**
   - Go to: Site settings > Environment variables
   - Add the following variables:
     ```
     PROTOCOL_PRIVATE_KEY=0x5d784bae6e0041f4cfca701f8c77b8c5250cc189f0a8aee1b227f39e7134c78b
     CONTRACT_ADDRESS=0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4
     ```
   - ⚠️ **SECURITY:** Never commit these keys to git!

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically deploy your functions

#### Option B: Via Netlify CLI

```powershell
# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### 4. Get Your API Endpoint

After deployment, your API will be available at:
```
https://your-site-name.netlify.app/api/close-position
```

## Update Client Code

Update your `client-example.js` or mobile app to use the Netlify URL:

```javascript
const BACKEND_URL = "https://your-site-name.netlify.app/api/close-position";

const response = await fetch(BACKEND_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    positionId: positionId.toString(),
    userAddress: userAccount.accountAddress.toString(),
    rawTransaction: Buffer.from(rawTxn.bcsToBytes()).toString('hex')
  }),
});
```

## Testing Your Deployment

```powershell
# Test the deployed function
curl -X POST https://your-site-name.netlify.app/api/close-position \
  -H "Content-Type: application/json" \
  -d '{"positionId":"4","userAddress":"0x...","rawTransaction":"..."}'
```

## Monitoring

- **Function Logs:** Site settings > Functions > View logs
- **Analytics:** https://app.netlify.com > Your site > Analytics
- **Error Tracking:** Available in function logs

## Security Best Practices

1. ✅ Environment variables stored in Netlify (not in code)
2. ✅ CORS headers configured for your frontend domain
3. ✅ Rate limiting (consider adding Netlify Edge Functions)
4. ✅ Input validation on all requests
5. ⚠️ Consider adding authentication (JWT, API keys)

## Troubleshooting

### Function doesn't work
- Check function logs in Netlify dashboard
- Verify environment variables are set correctly
- Ensure dependencies are in `package.json`

### CORS errors
- Update `netlify.toml` headers to allow your frontend domain
- Replace `*` with your specific domain in production

### Cold starts
- Netlify Functions may have ~1-2s cold start delay
- Consider upgrading to Netlify Pro for faster function execution

## Costs

- **Free Tier:** 125,000 function requests/month
- **Pro Tier ($19/mo):** 2,000,000 requests/month
- More info: https://www.netlify.com/pricing/

## Alternative: Use Render or Railway

If you prefer a traditional Express server instead of serverless:

- **Render:** https://render.com (free tier available)
- **Railway:** https://railway.app (usage-based pricing)
- **Heroku:** https://heroku.com (no free tier)

Both support Express.js out of the box without modification.
