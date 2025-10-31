"use client";

import { useState, useMemo } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignTypedData, useChainId, useReadContract, useConfig } from 'wagmi';
import { PaymentForm, type WagmiConfig } from "selfx402-pay-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Sparkles, Shield, Zap, Mail, FileText, CheckCircle, ArrowRight, Wallet } from "lucide-react";
import { toast } from "sonner";

type Step = "intro" | "form" | "payment" | "success";

interface FormData {
  email: string;
  jobDescription: string;
  resume: string;
  companyName?: string;
  positionTitle?: string;
}

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    jobDescription: "",
    resume: "",
    companyName: "",
    positionTitle: "",
  });

  // Wagmi hooks
  const wagmiConfig = useConfig();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  const { refetch: readContract } = useReadContract();

  // Create WagmiConfig object for payment widget
  const wagmiConfigProp: WagmiConfig = useMemo(() => ({
    config: wagmiConfig,
    address,
    isConnected,
    chainId,
    signTypedDataAsync,
    readContract: async (args: any) => {
      const result = await readContract(args as any);
      return result.data;
    }
  }), [wagmiConfig, address, isConnected, chainId, signTypedDataAsync, readContract]);

  // Vendor configuration
  const vendorUrl = process.env.NEXT_PUBLIC_VENDOR_API_URL || "http://localhost:3000";
  const apiEndpoint = "/api/generate-cover-letter";

  // Form validation and submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.email || !formData.jobDescription || !formData.resume) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate minimum lengths
    if (formData.jobDescription.length < 50) {
      toast.error("Job description must be at least 50 characters");
      return;
    }

    if (formData.resume.length < 100) {
      toast.error("Resume must be at least 100 characters");
      return;
    }

    // Move to payment step
    setCurrentStep("payment");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Payment callbacks
  const handlePaymentSuccess = (data: any) => {
    console.log("[JobAssistant] Payment successful!", data);
    setPaymentCompleted(true);
    toast.success("Cover letter generated and sent to your email!");
  };

  const handlePaymentFailure = (error: Error) => {
    console.error("[JobAssistant] Payment failed!", error);
    toast.error(`Payment failed: ${error.message}`);
  };

  // Step 1: Introduction and Wallet Connection
  if (currentStep === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">JobAssistant x402</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Cover Letters</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Land Your Dream Job with AI
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Generate personalized cover letters in seconds. Pay only $0.001 USDC with your crypto wallet.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    GPT-4 generates tailored cover letters matching your resume to the job
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Instant Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive your cover letter via email within 30 seconds
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Crypto Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay $0.001 USDC on Celo blockchain - fast and secure
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                      1
                    </div>
                    <Wallet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Connect Wallet</p>
                    <p className="text-xs text-muted-foreground">
                      Connect your crypto wallet (MetaMask, etc.)
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                      2
                    </div>
                    <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Fill Details</p>
                    <p className="text-xs text-muted-foreground">
                      Enter email, job description, and resume
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                      3
                    </div>
                    <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Pay & Generate</p>
                    <p className="text-xs text-muted-foreground">
                      $0.001 USDC payment via x402
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                      4
                    </div>
                    <Mail className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Receive Email</p>
                    <p className="text-xs text-muted-foreground">
                      Get your cover letter instantly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center space-y-4">
              {!isConnected ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Connect your wallet to get started
                  </p>
                  <ConnectButton />
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setCurrentStep("form")}
                  className="gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Step 2: Form Input
  if (currentStep === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold">JobAssistant x402</h1>
            </div>
            <ConnectButton />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Cover Letter Details
              </CardTitle>
              <CardDescription>
                Enter your information to generate a personalized cover letter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll send your cover letter to this email
                  </p>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name (optional)</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="e.g., TechCorp Inc"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Position Title */}
                <div className="space-y-2">
                  <Label htmlFor="positionTitle">Position Title (optional)</Label>
                  <Input
                    id="positionTitle"
                    name="positionTitle"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.positionTitle}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="jobDescription"
                    name="jobDescription"
                    placeholder="Paste the job description or job posting here..."
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    rows={6}
                    className="resize-none"
                    required
                    minLength={50}
                    maxLength={5000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.jobDescription.length}/5000 characters (minimum 50)
                  </p>
                </div>

                {/* Resume */}
                <div className="space-y-2">
                  <Label htmlFor="resume">
                    Your Resume/CV <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="resume"
                    name="resume"
                    placeholder="Paste your resume or CV content here..."
                    value={formData.resume}
                    onChange={handleInputChange}
                    rows={8}
                    className="resize-none"
                    required
                    minLength={100}
                    maxLength={10000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.resume.length}/10000 characters (minimum 100)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("intro")}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 gap-2">
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Step 3: Payment
  if (currentStep === "payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold">JobAssistant x402</h1>
            </div>
            <ConnectButton />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {!paymentCompleted ? (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">Complete Payment</h2>
                  <p className="text-muted-foreground">
                    Pay $0.001 USDC to generate your cover letter
                  </p>
                </div>

                <PaymentForm
                  vendorUrl={vendorUrl}
                  apiEndpoint={apiEndpoint}
                  requestMethod="POST"
                  requestBody={formData}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                  showDeepLink="both"
                  buttonText="Pay $0.001 & Generate Cover Letter"
                  wagmiConfig={wagmiConfigProp}
                />

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep("form")}
                  >
                    Back to Form
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8 items-start">
                {/* Left: Payment Receipt */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Payment Receipt</h3>
                    <p className="text-sm text-muted-foreground">Transaction completed successfully</p>
                  </div>
                  <PaymentForm
                    vendorUrl={vendorUrl}
                    apiEndpoint={apiEndpoint}
                    requestMethod="POST"
                    requestBody={formData}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentFailure={handlePaymentFailure}
                    showDeepLink="both"
                    buttonText="Pay $0.001 & Generate Cover Letter"
                    wagmiConfig={wagmiConfigProp}
                  />
                </div>

                {/* Right: Success Message */}
                <div className="flex items-start justify-center pt-8">
                  <Card className="w-full max-w-xl">
                    <CardContent className="pt-8 pb-8">
                      <div className="text-center space-y-6">
                        <div className="flex justify-center">
                          <div className="rounded-full bg-green-100 p-6">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Cover Letter Sent! 🎉</h2>
                          <p className="text-muted-foreground text-lg">
                            Your AI-generated cover letter has been sent to
                          </p>
                          <p className="text-xl font-semibold text-blue-600">
                            {formData.email}
                          </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                          <p className="text-sm text-blue-900 font-medium">
                            📬 Check your inbox (and spam folder)
                          </p>
                          <p className="text-sm text-blue-800">
                            Your personalized cover letter should arrive within 30 seconds
                          </p>
                        </div>

                        <div className="space-y-3 pt-4">
                          <Button
                            size="lg"
                            onClick={() => {
                              setCurrentStep("intro");
                              setPaymentCompleted(false);
                              setFormData({
                                email: "",
                                jobDescription: "",
                                resume: "",
                                companyName: "",
                                positionTitle: "",
                              });
                            }}
                            className="w-full gap-2"
                          >
                            Generate Another Cover Letter
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Step 4: Success
  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold">JobAssistant x402</h1>
            </div>
            <ConnectButton />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-6">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Cover Letter Sent! 🎉</h2>
                  <p className="text-muted-foreground text-lg">
                    Your AI-generated cover letter has been sent to
                  </p>
                  <p className="text-xl font-semibold text-blue-600">
                    {formData.email}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                  <p className="text-sm text-blue-900 font-medium">
                    📬 Check your inbox (and spam folder)
                  </p>
                  <p className="text-sm text-blue-800">
                    Your personalized cover letter should arrive within 30 seconds
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    size="lg"
                    onClick={() => {
                      setCurrentStep("intro");
                      setFormData({
                        email: "",
                        jobDescription: "",
                        resume: "",
                        companyName: "",
                        positionTitle: "",
                      });
                    }}
                    className="w-full gap-2"
                  >
                    Generate Another Cover Letter
                    <Sparkles className="w-5 h-5" />
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Powered by Self Protocol + x402 + Celo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return null;
}
