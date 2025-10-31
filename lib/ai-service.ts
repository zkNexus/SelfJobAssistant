import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface CoverLetterInput {
  resume: string;
  jobDescription: string;
  companyName?: string;
  positionTitle?: string;
}

export async function generateCoverLetter(input: CoverLetterInput): Promise<string> {
  const { resume, jobDescription, companyName, positionTitle } = input;

  const prompt = `You are an expert career coach and professional cover letter writer. Generate a compelling, personalized cover letter based on the following information:

RESUME/CV:
${resume}

JOB DESCRIPTION:
${jobDescription}

${companyName ? `COMPANY NAME: ${companyName}` : ""}
${positionTitle ? `POSITION TITLE: ${positionTitle}` : ""}

INSTRUCTIONS:
1. Write a professional, engaging cover letter that highlights the candidate's most relevant experience and skills
2. Match the tone and style to the job description and company culture
3. Open with a strong hook that captures attention
4. Use specific examples from the resume that align with job requirements
5. Show enthusiasm and genuine interest in the role
6. Keep it concise (300-400 words)
7. Use a professional but personable tone
8. Include a clear call to action
9. Format properly with paragraphs and spacing

Generate ONLY the cover letter text without any additional commentary or explanations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert professional cover letter writer with 15 years of experience helping candidates land their dream jobs. You write compelling, personalized cover letters that highlight candidates' strengths and match them to job requirements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const coverLetter = completion.choices[0]?.message?.content;

    if (!coverLetter) {
      throw new Error("Failed to generate cover letter - empty response from AI");
    }

    return coverLetter.trim();
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error(`Cover letter generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function validateAIServiceConfiguration(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not configured");
    return false;
  }
  return true;
}
