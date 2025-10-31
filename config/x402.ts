// Local type definitions (not exported from selfx402-framework)
interface X402Config {
  network: "celo" | "celo-sepolia";
  facilitatorUrl: string;
  paymentPrice: string;
  walletAddress: string;
}

interface PaymentRoute {
  price: string;
  network: string;
  discoverable: boolean;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
  examples?: any[];
}

const isProduction = process.env.NODE_ENV === "production";

export const x402Config: X402Config = {
  network: "celo" as const,
  facilitatorUrl: process.env.FACILITATOR_URL || "https://facilitator.selfx402.xyz",
  paymentPrice: "0.001", // $0.001 USDC per cover letter
  walletAddress: process.env.PAYMENT_WALLET_ADDRESS!,
};

export const paymentRoutes: Record<string, PaymentRoute> = {
  "POST /api/generate-cover-letter": {
    price: "0.001",
    network: x402Config.network,
    discoverable: isProduction,
    description: "AI-powered cover letter generation - Send personalized cover letter to email",
    inputSchema: {
      type: "object",
      required: ["jobDescription", "resume"],
      properties: {
        email: {
          type: "string",
          format: "email",
          description: "Email address (optional, for future email delivery)"
        },
        jobDescription: {
          type: "string",
          minLength: 50,
          maxLength: 5000,
          description: "Job description or posting (50-5000 characters)"
        },
        resume: {
          type: "string",
          minLength: 100,
          maxLength: 10000,
          description: "Your resume/CV content (100-10000 characters)"
        },
        companyName: {
          type: "string",
          maxLength: 200,
          description: "Company name (optional)"
        },
        positionTitle: {
          type: "string",
          maxLength: 200,
          description: "Job position title (optional)"
        }
      },
      additionalProperties: false
    },
    outputSchema: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          description: "Whether the cover letter was generated and sent"
        },
        message: {
          type: "string",
          description: "Status message"
        },
        coverLetter: {
          type: "string",
          description: "The complete generated cover letter"
        },
        companyName: {
          type: "string",
          description: "Company name (if provided)"
        },
        positionTitle: {
          type: "string",
          description: "Position title (if provided)"
        },
        generatedAt: {
          type: "string",
          format: "date-time",
          description: "Timestamp when the cover letter was generated"
        }
      }
    },
    examples: [
      {
        input: {
          email: "user@example.com",
          jobDescription: "We are seeking a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern web technologies...",
          resume: "John Doe\nSenior Software Engineer\n\nEXPERIENCE:\n- 6 years of React development\n- TypeScript expert\n- Led team of 5 developers...",
          companyName: "TechCorp Inc",
          positionTitle: "Senior Frontend Developer"
        },
        output: {
          success: true,
          message: "Cover letter generated and sent successfully",
          coverLetter: "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Frontend Developer position at TechCorp Inc...",
          sentTo: "user@example.com",
          generatedAt: "2025-10-30T12:00:00Z"
        }
      }
    ]
  }
};

export const serviceDiscovery = {
  version: 1,
  facilitatorUrl: x402Config.facilitatorUrl,
  payment: {
    network: x402Config.network,
    asset: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", // Celo USDC
    payTo: x402Config.walletAddress,
  },
  verification: {
    enabled: true,
    requirements: {
      minimumAge: 18,
      excludedCountries: [] as string[],
      ofac: false,
    },
    scope: "jobassistant-x402-v1",
  },
  pricing: {
    tiers: {
      unverified: {
        price: "0.001",
        description: "Bot pricing - $0.001 per cover letter"
      },
      verified_human: {
        price: "0.001",
        description: "Verified human pricing - $0.001 per cover letter (100x cheaper)"
      }
    }
  },
  routes: paymentRoutes, // Show routes in all environments for testing
};
