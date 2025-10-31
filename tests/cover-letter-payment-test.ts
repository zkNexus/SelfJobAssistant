/**
 * JobAssistant x402 Payment Test
 *
 * Tests the complete cover letter generation flow with x402 payment:
 * 1. Generates payment envelope signed with test wallet
 * 2. Sends POST request to /api/generate-cover-letter endpoint
 * 3. Verifies payment through Selfx402Facilitator
 * 4. Receives cover letter generation confirmation
 */

import { config } from 'dotenv';
import { createWalletClient, http, parseUnits, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celo } from 'viem/chains';
import axios from 'axios';

// Load environment variables from .env file
config();

// USDC contract address on Celo Mainnet
const USDC_ADDRESS = '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' as Address;

// EIP-712 domain for USDC transferWithAuthorization on Celo Mainnet
const EIP712_DOMAIN = {
  name: 'USD Coin',
  version: '2',
  chainId: celo.id, // 42220
  verifyingContract: USDC_ADDRESS,
} as const;

// EIP-712 types for transferWithAuthorization
const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

interface TestConfig {
  privateKey: Address;
  walletAddress: Address;
  apiBaseUrl: string;
  facilitatorUrl: string;
  paymentAmountUsd: string;
  network: string;
}

function loadTestConfig(): TestConfig {
  const privateKey = process.env.TEST_WALLET_PRIVATE_KEY as Address;
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  const facilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.selfx402.xyz';
  const paymentAmountUsd = process.env.PAYMENT_AMOUNT_USD || '0.1';
  const network = process.env.NETWORK || 'celo';

  if (!privateKey || privateKey === '0xYourPrivateKeyHere') {
    throw new Error('❌ TEST_WALLET_PRIVATE_KEY not set in .env file');
  }

  // Derive wallet address from private key
  const account = privateKeyToAccount(privateKey);
  const walletAddress = account.address;

  return {
    privateKey,
    walletAddress,
    apiBaseUrl,
    facilitatorUrl,
    paymentAmountUsd,
    network,
  };
}

async function testCoverLetterPayment() {
  console.log('🧪 Starting JobAssistant x402 Payment Test\n');

  try {
    // Load configuration
    const config = loadTestConfig();
    console.log('✅ Configuration loaded:');
    console.log(`   Network: ${config.network}`);
    console.log(`   Wallet: ${config.walletAddress}`);
    console.log(`   API: ${config.apiBaseUrl}`);
    console.log(`   Facilitator: ${config.facilitatorUrl}`);
    console.log(`   Amount: $${config.paymentAmountUsd}\n`);

    // Create wallet client
    const account = privateKeyToAccount(config.privateKey);
    const walletClient = createWalletClient({
      account,
      chain: celo,
      transport: http(),
    });

    console.log('✅ Wallet client created\n');

    // Step 1: Get payment requirements from API
    console.log('📋 Step 1: Fetching payment requirements from /.well-known/x402...');
    const discoveryResponse = await axios.get(`${config.apiBaseUrl}/.well-known/x402`);
    const { payment, routes } = discoveryResponse.data;
    const payTo = payment.payTo;

    console.log(`   PayTo address: ${payTo}`);
    console.log(`   Available routes: ${Object.keys(routes).length}\n`);

    // Step 2: Prepare payment envelope
    console.log('📝 Step 2: Preparing payment envelope...');

    const route = routes['POST /api/generate-cover-letter'];
    if (!route) {
      throw new Error('❌ Route POST /api/generate-cover-letter not found in discovery');
    }

    const priceValue = route.price.toString().replace("$", "");
    const amountInUSDC = parseUnits(priceValue, 6); // USDC has 6 decimals
    const validAfter = 0n;
    const validBefore = BigInt(Math.floor(Date.now() / 1000) + 3600); // Valid for 1 hour
    const nonce = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` as Address;

    console.log(`   Amount: ${amountInUSDC} (${route.price} USDC)`);
    console.log(`   Valid until: ${new Date(Number(validBefore) * 1000).toISOString()}`);
    console.log(`   Nonce: ${nonce.slice(0, 10)}...\n`);

    // Step 3: Sign the payment authorization
    console.log('✍️  Step 3: Signing payment authorization...');

    const signature = await walletClient.signTypedData({
      account,
      domain: EIP712_DOMAIN,
      types: TRANSFER_WITH_AUTHORIZATION_TYPES,
      primaryType: 'TransferWithAuthorization',
      message: {
        from: config.walletAddress,
        to: payTo as Address,
        value: amountInUSDC,
        validAfter,
        validBefore,
        nonce,
      },
    });

    console.log(`   Signature: ${signature.slice(0, 20)}...\n`);

    // Step 4: Create x402 payment envelope
    console.log('📦 Step 4: Creating x402 payment envelope...');

    const paymentEnvelope = {
      network: config.network,
      authorization: {
        from: config.walletAddress,
        to: payTo,
        value: amountInUSDC.toString(),
        validAfter: Number(validAfter),
        validBefore: Number(validBefore),
        nonce,
      },
      signature,
    };

    console.log('   Envelope created ✓\n');

    // Step 5: Prepare cover letter request body
    console.log('📄 Step 5: Preparing cover letter request...');

    const requestBody = {
      email: 'test@example.com',
      jobDescription: `
We are seeking a talented Full Stack Developer to join our growing team.
The ideal candidate will have 3+ years of experience with React, Node.js,
and modern web technologies. You'll work on building scalable applications
that serve millions of users. Strong problem-solving skills and the ability
to work in a fast-paced environment are essential.
      `.trim(),
      resume: `
John Doe
Full Stack Developer | 5 years experience

EXPERIENCE:
- Senior Developer at TechCorp (2020-2024)
  * Built React applications serving 1M+ users
  * Implemented microservices architecture with Node.js
  * Led team of 4 developers on critical projects

- Developer at StartupXYZ (2018-2020)
  * Developed full-stack web applications
  * Worked with React, Express, PostgreSQL
  * Improved performance by 40%

SKILLS:
React, Node.js, TypeScript, PostgreSQL, AWS, Docker, Git

EDUCATION:
BS Computer Science, State University (2018)
      `.trim(),
      companyName: 'TechCorp Inc.',
      positionTitle: 'Full Stack Developer',
    };

    console.log('   Email: test@example.com');
    console.log('   Company: TechCorp Inc.');
    console.log('   Position: Full Stack Developer\n');

    // Step 6: Make payment request to API
    console.log('💳 Step 6: Sending payment request to /api/generate-cover-letter...');

    const startTime = Date.now();
    const response = await axios.post(
      `${config.apiBaseUrl}/api/generate-cover-letter`,
      requestBody,
      {
        headers: {
          'x-payment': JSON.stringify(paymentEnvelope),
          'Content-Type': 'application/json',
        },
      }
    );
    const endTime = Date.now();

    console.log(`   Response time: ${endTime - startTime}ms`);
    console.log(`   Status: ${response.status}\n`);

    // Step 7: Verify response
    console.log('✅ Step 7: Verifying response...');

    if (response.status === 200) {
      console.log('   ✓ Payment accepted!');
      console.log('   ✓ Cover letter generated and sent!\n');
      console.log(JSON.stringify(response.data, null, 2));

      // Verify response structure
      if (response.data.success && response.data.coverLetter && response.data.sentTo) {
        console.log('\n✅ Response structure validated ✓');
        console.log(`   Success: ${response.data.success}`);
        console.log(`   Message: ${response.data.message}`);
        console.log(`   Sent to: ${response.data.sentTo}`);
        console.log(`   Generated at: ${response.data.generatedAt}`);
        console.log(`   Cover letter preview: ${response.data.coverLetter}`);
      }

      console.log('\n🎉 TEST PASSED - Cover letter payment flow completed successfully!\n');
      console.log('📧 Check your email at test@example.com for the full cover letter');
      return true;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

  } catch (error: any) {
    console.error('\n❌ TEST FAILED\n');

    if (error.response) {
      console.error('API Error Response:');
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data:`, error.response.data);

      if (error.response.status === 402) {
        console.error('\n💡 Payment Required Error - Possible causes:');
        console.error('  1. Missing X-Payment header');
        console.error('  2. Invalid payment signature');
        console.error('  3. Insufficient USDC balance');
        console.error('  4. Facilitator verification failed');
      }
    } else if (error.request) {
      console.error('No response received from API');
      console.error('  Make sure the JobAssistant server is running:');
      console.error('  cd Vendors/JobAssistant && npm run dev');
    } else {
      console.error('Error:', error.message);
    }

    throw error;
  }
}

// Run test
testCoverLetterPayment()
  .then(() => {
    console.log('✅ All tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
