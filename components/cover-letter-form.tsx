"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CoverLetterFormProps {
  onPaymentRequired: (formData: FormData) => void;
}

export interface FormData {
  email: string;
  jobDescription: string;
  resume: string;
  companyName?: string;
  positionTitle?: string;
}

export function CoverLetterForm({ onPaymentRequired }: CoverLetterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    jobDescription: "",
    resume: "",
    companyName: "",
    positionTitle: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Trigger payment flow
    onPaymentRequired(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Cover Letter Sent! 🎉</h2>
            <p className="text-muted-foreground">
              Your AI-generated cover letter has been sent to{" "}
              <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Check your inbox (and spam folder) for your personalized cover letter.
            </p>
            <Button onClick={() => setSuccess(false)} className="mt-4">
              Generate Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          AI Cover Letter Generator
        </CardTitle>
        <CardDescription>
          Generate a personalized cover letter for only $0.10 USDC (verified humans)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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

          {/* Submit Button */}
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Cover Letter ($0.10 USDC)
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                💳 Payment processed via x402 on Celo blockchain
              </p>
              <p className="text-xs text-muted-foreground">
                ✨ Verified humans pay 10x less than bots ($0.10 vs $1.00)
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
