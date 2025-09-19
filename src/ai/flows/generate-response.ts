'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating supportive and relevant responses from the chatbot based on user input.
 *
 * - generateResponse - A function that takes user input and returns a supportive chatbot response.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseInputSchema = z.object({
  userInput: z.string().describe('The user input to the chatbot.'),
  conversationHistory: z.string().optional().describe('The history of the conversation. Defaults to empty string if not provided.')
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response to the user input.'),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return generateResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {schema: GenerateResponseInputSchema},
  output: {schema: GenerateResponseOutputSchema},
  prompt: `You are a mental health support chatbot. Your goal is to provide supportive and relevant responses to the user based on their input.

User Input: {{{userInput}}}

{{#if conversationHistory}}
Conversation History:
{{{conversationHistory}}}
{{/if}}

Chatbot Response:`, // Keep it open-ended for a chatbot response.
});

const generateResponseFlow = ai.defineFlow(
  {
    name: 'generateResponseFlow',
    inputSchema: GenerateResponseInputSchema,
    outputSchema: GenerateResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
