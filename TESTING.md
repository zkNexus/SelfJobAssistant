# JobAssistant Testing Guide

Complete guide to test the x402 payment flow for cover letter generation.

## Prerequisites

Before running tests, ensure you have:

1. ✅ **Test wallet with USDC on Celo Mainnet**
   - Minimum 0.1 USDC balance
   - USDC Contract: `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`
   - Get CELO from exchanges (Coinbase, Binance)
   - Swap CELO → USDC on [Ubeswap](https://app.ubeswap.org/)

2. ✅ **OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Create key at https://platform.openai.com/api-keys
   - Starts with `sk-proj-...` or `sk-...`

3. ✅ **Email SMTP Credentials** (Gmail recommended)
   - Enable 2-Factor Authentication
   - Create App Password: https://myaccount.google.com/apppasswords
   - Use app password (not regular Gmail password)

4. ✅ **WalletConnect Project ID** (for frontend)
   - Sign up at https://cloud.walletconnect.com
   - Create new project
   - Copy Project ID

## Setup Instructions

### 1. Install Dependencies

```bash
cd Vendors/JobAssistant
npm install
```

### 2. Configure Environment Variables

Create `.env` file in `Vendors/JobAssistant/`:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Celo Network Configuration
NODE_ENV=development
PORT=3001

# x402 Payment Configuration (RECEIVING wallet)
PAYMENT_WALLET_ADDRESS=0xYourReceivingWalletAddress  # Where USDC is sent TO
FACILITATOR_URL=https://facilitator.selfx402.xyz
PAYMENT_PRICE_USD=0.1

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here  # 16-character app password

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 3. Configure Test Environment

Create `test-env.local` file in `Vendors/JobAssistant/`:

```bash
# Test Wallet Configuration (Celo Mainnet)
TEST_WALLET_PRIVATE_KEY=0xYourPrivateKeyHere  # Wallet that SENDS payment
TEST_WALLET_ADDRESS=0xYourWalletAddressHere

# API Configuration
API_BASE_URL=http://localhost:3001
FACILITATOR_URL=https://facilitator.selfx402.xyz

# Payment Configuration
PAYMENT_AMOUNT_USD=0.1
NETWORK=celo
```

**IMPORTANT**:
- `TEST_WALLET_PRIVATE_KEY` = Wallet that PAYS (needs USDC balance)
- `PAYMENT_WALLET_ADDRESS` = Wallet that RECEIVES payment
- These can be the same wallet or different wallets

### 4. Get Test Private Key from MetaMask

1. Open MetaMask browser extension
2. Click account icon → Settings
3. Select "Security & Privacy"
4. Click "Show private key"
5. Enter MetaMask password
6. Copy private key (starts with `0x`)
7. Add to `test-env.local` as `TEST_WALLET_PRIVATE_KEY`

### 5. Verify USDC Balance

Check your wallet has USDC on Celo:

- **Block Explorer**: https://celoscan.io/address/YOUR_ADDRESS
- **USDC Token**: https://celoscan.io/token/0xceba9300f2b948710d2653dd7b07f33a8b32118c

## Running Tests

### Test 1: Backend Payment Flow (Recommended First)

Tests the complete x402 payment flow:

```bash
# Terminal 1: Start the Next.js server
cd Vendors/JobAssistant
npm run dev

# Terminal 2: Run the payment test
npm run test:payment
```

**Expected Output:**

```
🧪 Starting JobAssistant x402 Payment Test

✅ Configuration loaded:
   Network: celo
   Wallet: 0x499D377eF114cC1BF7798cECBB38412701400daF
   API: http://localhost:3001
   Facilitator: https://facilitator.selfx402.xyz
   Amount: $0.1

✅ Wallet client created

📋 Step 1: Fetching payment requirements from /.well-known/x402...
   PayTo address: 0x...
   Available routes: 1

📝 Step 2: Preparing payment envelope...
   Amount: 100000 ($0.1 USDC)
   Valid until: 2025-10-30T12:00:00.000Z
   Nonce: 0x1234abcd...

✍️  Step 3: Signing payment authorization...
   Signature: 0xabcd1234...

📦 Step 4: Creating x402 payment envelope...
   Envelope created ✓

📄 Step 5: Preparing cover letter request...
   Email: test@example.com
   Company: TechCorp Inc.
   Position: Full Stack Developer

💳 Step 6: Sending payment request to /api/generate-cover-letter...
   Response time: 3500ms
   Status: 200

✅ Step 7: Verifying response...
   ✓ Payment accepted!
   ✓ Cover letter generated and sent!

{
  "success": true,
  "message": "Cover letter generated and sent successfully",
  "coverLetter": "Dear Hiring Manager...",
  "sentTo": "test@example.com",
  "generatedAt": "2025-10-30T11:00:00.000Z"
}

✅ Response structure validated ✓
   Success: true
   Message: Cover letter generated and sent successfully
   Sent to: test@example.com
   Generated at: 2025-10-30T11:00:00.000Z

🎉 TEST PASSED - Cover letter payment flow completed successfully!

📧 Check your email at test@example.com for the full cover letter
```

### Test 2: Frontend Flow (Manual Testing)

Test the complete user experience:

1. **Start Development Server:**
   ```bash
   cd Vendors/JobAssistant
   npm run dev
   ```

2. **Open Browser:**
   - Navigate to: http://localhost:3001

3. **Follow User Flow:**

   **Step 1: Introduction**
   - Click "Connect Wallet" button
   - Connect with MetaMask or WalletConnect
   - Verify wallet connected (address shown)
   - Click "Continue to Form"

   **Step 2: Input Form**
   - Enter your email address
   - Paste job description (50+ characters)
   - Paste your resume (100+ characters)
   - (Optional) Add company name
   - (Optional) Add position title
   - Click "Continue to Payment"

   **Step 3: Payment**
   - Review payment details ($0.10 USDC)
   - Click "Pay $0.10 & Generate Cover Letter"
   - Approve MetaMask signature request
   - Wait for payment processing (3-5 seconds)

   **Step 4: Success**
   - See confirmation message
   - Email sent notification
   - Option to generate another letter

4. **Verify Email:**
   - Check inbox at the email address you provided
   - Look for "Your AI-Generated Cover Letter"
   - Verify cover letter content is relevant

## Troubleshooting

### Error: "TEST_WALLET_PRIVATE_KEY not set"

**Solution:** Add private key to `test-env.local`

```bash
TEST_WALLET_PRIVATE_KEY=0xYourActualPrivateKeyHere
TEST_WALLET_ADDRESS=0xYourWalletAddress
```

### Error: "Payment required" (402)

**Causes:**
1. Missing X-Payment header
2. Invalid payment signature
3. Insufficient USDC balance
4. Facilitator verification failed

**Solution:**
- Check USDC balance: https://celoscan.io/address/YOUR_ADDRESS
- Verify facilitator is running: https://facilitator.selfx402.xyz
- Check network matches: `celo` (not `celo-sepolia`)

### Error: "OpenAI API key not found"

**Solution:** Add OpenAI key to `.env`

```bash
OPENAI_API_KEY=sk-proj-your-actual-openai-key
```

Verify at: https://platform.openai.com/api-keys

### Error: "SMTP authentication failed"

**Solutions:**

**For Gmail:**
1. Enable 2-Factor Authentication
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use 16-character app password (not regular password)

```bash
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # 16-character app password
```

**For other providers:**
- Check SMTP host and port
- Verify credentials
- Enable "less secure apps" if required

### Error: "No response from API"

**Solution:** Ensure server is running

```bash
cd Vendors/JobAssistant
npm run dev

# Should see:
# ▲ Next.js 14.2.28
# - Local:        http://localhost:3001
```

### Error: "Facilitator timeout"

**Causes:**
- Network connectivity issues
- Facilitator service down
- Invalid payment envelope

**Solution:**
- Check facilitator status: https://facilitator.selfx402.xyz
- Verify network connection
- Check payment envelope structure in test logs

### Wallet Connection Issues (Frontend)

**MetaMask not appearing:**
1. Install MetaMask browser extension
2. Create/import wallet
3. Switch to Celo network (Chain ID: 42220)
4. Refresh page

**Wrong network:**
- MetaMask will auto-prompt to switch to Celo
- Or manually add Celo network:
  - Network Name: Celo
  - RPC URL: https://forno.celo.org
  - Chain ID: 42220
  - Symbol: CELO
  - Explorer: https://celoscan.io

## Test Coverage

The test suite validates:

✅ Service discovery (/.well-known/x402)
✅ Payment envelope creation
✅ EIP-712 signature generation
✅ x402 payment header formatting
✅ Facilitator verification
✅ OpenAI cover letter generation
✅ Email delivery
✅ Response structure validation
✅ Error handling (402, 400, 500)

## Next Steps

After successful testing:

1. **Deploy to Production:**
   - Update `.env` with production values
   - Deploy to Vercel/Railway/your hosting platform
   - Update `NEXT_PUBLIC_API_URL` to production URL

2. **Update Frontend URL:**
   - Update facilitator URL if hosting your own
   - Configure custom domain
   - Update CORS settings

3. **Monitor Payments:**
   - Check receiving wallet for USDC: https://celoscan.io
   - Monitor API logs for errors
   - Track email delivery rates

4. **Scale Infrastructure:**
   - Add Redis for rate limiting
   - Implement queue for email sending
   - Add monitoring (Sentry, DataDog)

## Security Checklist

Before production deployment:

- [ ] Never commit `.env` or `test-env.local` files
- [ ] Rotate test private keys (don't use with real funds)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API endpoints
- [ ] Implement CORS whitelist
- [ ] Add input validation and sanitization
- [ ] Monitor for suspicious payment patterns
- [ ] Set up alerts for failed payments
- [ ] Regular security audits of dependencies

## Support

For issues:
1. Check logs in terminal
2. Review error messages
3. Verify environment variables
4. Check network connectivity
5. Consult main README.md for architecture details

**Reference Working Projects:**
- **Places-x402-Api**: Example vendor implementation
- **Selfx402Pay**: Frontend payment integration example
- **Selfx402Facilitator**: Payment verification service
