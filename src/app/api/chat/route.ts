import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getFolderContext } from '@/lib/contextReader';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, mode } = await req.json(); // mode is 'portfolio' or 'tutor'

  // 1. Fetch the correct context based on the route
  const folder = mode === 'portfolio' ? 'bio' : 'knowledge';
  const contextData = getFolderContext(folder);

  // 2. Define the Personas
  const systemPrompts = {
    portfolio: `
      You are Joshua Piña's digital twin. You are a Program Manager, Data Science grad (GSU), and former Army Medic.
      Use the provided context to answer questions about Josh's career, projects (Snape, SignalREI), and background.
      Tone: Professional, direct, with a touch of veteran grit. 
      Context: ${contextData}
    `,
    tutor: `
      You are Josh's AI Study Tutor. Your goal is to help him master concepts from his GSU courses and AWS Solutions Architect prep.
      Use the provided notes to explain things, quiz him, and clarify complex topics.
      Tone: Encouraging, academic, but clear. If the answer isn't in his notes, tell him, then provide a general technical explanation.
      Context: ${contextData}
    `
  };

  // 3. Call Gemini 2.5 Flash
  const result = await streamText({
    model: google('gemini-1.5-flash'), // or gemini-2.0-flash-exp if available
    messages,
    system: systemPrompts[mode as keyof typeof systemPrompts],
  });

  return result.toDataStreamResponse();
}