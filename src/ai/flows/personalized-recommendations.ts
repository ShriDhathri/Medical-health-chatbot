'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized recommendations for mental health exercises and activities.
 *
 * It uses the user's mood and conversation history to tailor the recommendations.
 * @fileOverview This file defines a Genkit flow for providing personalized recommendations for mental health exercises and activities.
 *
 * It uses the user's mood and conversation history to tailor the recommendations.
 * - `getPersonalizedRecommendations`: A function that takes mood and conversation history as input and returns personalized recommendations.
 * - `PersonalizedRecommendationsInput`: The input type for the `getPersonalizedRecommendations` function.
 * - `PersonalizedRecommendationsOutput`: The output type for the `getPersonalizedRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  mood: z.string().describe('The current mood of the user (e.g., happy, sad, anxious).'),
  conversationHistory: z
    .string()
    .describe('The recent conversation history of the user with the chatbot.'),
});
export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe(
      'A list of personalized recommendations for mental health exercises and activities.'
    ),
});
export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `Based on the user's current mood: {{{mood}}} and their recent conversation history: {{{conversationHistory}}}, provide a list of personalized recommendations for mental health exercises and activities.  The list should be tailored to help manage their well-being. Each recommendation should be a single short sentence describing a specific action the user can take.

  The recommendations should be practical and actionable, such as:
  - "Try a 5-minute guided meditation to reduce anxiety."
  - "Write down three things you are grateful for to boost your mood."
  - "Engage in a light exercise like walking or stretching."
`,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);
