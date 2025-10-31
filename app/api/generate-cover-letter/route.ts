import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateCoverLetter } from "@/lib/ai-service";
import { sendCoverLetterEmail } from "@/lib/email-service";

// Input validation schema
const coverLetterRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  jobDescription: z.string().min(50, "Job description too short").max(5000, "Job description too long"),
  resume: z.string().min(100, "Resume too short").max(10000, "Resume too long"),
  companyName: z.string().max(200).optional(),
  positionTitle: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = coverLetterRequestSchema.parse(body);

    const { email, jobDescription, resume, companyName, positionTitle } = validatedData;

    // Check for x402 payment header (middleware should have validated this)
    const paymentHeader = request.headers.get("x-payment");
    if (!paymentHeader) {
      return NextResponse.json(
        {
          error: "Payment required",
          message: "This endpoint requires x402 payment. Please include X-Payment header.",
          price: "0.1",
          network: "celo",
        },
        { status: 402 } // HTTP 402 Payment Required
      );
    }

    console.log("Generating cover letter...");

    // Generate cover letter using AI
    const coverLetter = await generateCoverLetter({
      resume,
      jobDescription,
      companyName,
      positionTitle,
    });

    console.log("Cover letter generated successfully");

    // Send email with cover letter
    console.log(`Sending cover letter to: ${email}`);
    try {
      await sendCoverLetterEmail({
        to: email,
        subject: positionTitle && companyName
          ? `Your Cover Letter for ${positionTitle} at ${companyName}`
          : "Your AI-Generated Cover Letter",
        coverLetter,
        companyName,
        positionTitle,
      });
      console.log("Email sent successfully");
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Continue with response even if email fails
    }

    // Return success response with full cover letter
    return NextResponse.json(
      {
        success: true,
        message: "Cover letter generated and sent to your email",
        coverLetter, // Return full cover letter
        sentTo: email,
        companyName,
        positionTitle,
        generatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Cover letter generation error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors.map(e => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Service discovery endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/generate-cover-letter",
    method: "POST",
    description: "Generate personalized cover letter and send via email",
    price: "0.1 USDC",
    network: "celo",
    inputSchema: {
      email: "string (email format, required)",
      jobDescription: "string (50-5000 chars, required)",
      resume: "string (100-10000 chars, required)",
      companyName: "string (optional)",
      positionTitle: "string (optional)",
    },
    outputSchema: {
      success: "boolean",
      message: "string",
      coverLetter: "string (preview)",
      sentTo: "string (email)",
      generatedAt: "string (ISO 8601)",
    },
  });
}
