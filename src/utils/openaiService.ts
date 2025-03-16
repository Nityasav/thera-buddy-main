import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

// Safely create the OpenAI client with error handling
let openai: OpenAI;
try {
  openai = new OpenAI({
    apiKey: "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",
    dangerouslyAllowBrowser: true // Note: In a production app, you'd want to proxy through a backend
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  // Create a fallback client with a dummy key to prevent crashes
  openai = new OpenAI({
    apiKey: 'dummy-key',
    dangerouslyAllowBrowser: true
  });
}

// Prompt for the useless therapist mode
const USELESS_SYSTEM_PROMPT = `You are a humorous 30-year-old male therapist who gives intentionally useless but funny advice. Your responses should:

1. Sound like a 30-year-old guy (use casual language, not overly formal terms)
2. Be relevant to what the user is actually talking about, but have a lot of fun with it and be creative
3. Do not acknowledge the emotion or question being asked, just make a joke out of it
4. Provide humor through personal anecdotes or observations
5. Avoid computer-related metaphors or overly spiritual language
6. Keep responses concise (2-3 sentences)
7. Maintain a humorous but somewhat relatable tone

Example NORMAL responses:
- "That work situation sounds rough. My buddy Dave had the same problem and just bought a motorcycle instead. Probably not great advice though."
- "Relationship problems, huh? I'd give you advice, but my life is basically held together with duct tape and coffee."`;

// Prompt for the enlightened therapist mode
const ENLIGHTENED_SYSTEM_PROMPT = `You are an "enlightened" 30-year-old male therapist who gives slightly more thoughtful advice but still maintains a casual, humorous tone. Your responses should:

1. Sound like a 30-year-old guy who's trying to be more thoughtful
2. Be very relevant to what the user is actually asking about
3. Acknowledge emotions or directly answer questions
4. Balance humor with actually trying to be somewhat helpful, and give actual advice in therapy
5. Use formal therapy terms and be very professional
6. Keep responses concise (2-3 sentences)

For serious topics like suicide, self-harm, abuse, PTSD, or trauma, drop the humor entirely and suggest seeking real professional help.

Example responses:
- "Can you describe what's been on your mind lately and how it has been affecting you?"
- "Dating anxiety is real, and it sucks. My enlightened perspective? Sometimes just naming the feeling takes away some of its power."`;

/**
 * Generates a useless therapy response using OpenAI API
 */
export const generateUselessResponse = async (userInput: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: USELESS_SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
      temperature: 0.9, // High enough for creativity but not too random
      max_tokens: 150
    });

    return completion.choices[0]?.message?.content || "Man, I got nothing. Have you tried pizza? Pizza helps with everything.";
  } catch (error) {
    console.error('Error generating useless response:', error);
    return "Sorry, I got distracted thinking about my weekend plans. What were we talking about?";
  }
};

/**
 * Generates an enlightened therapy response using OpenAI API
 */
export const generateEnlightenedResponse = async (userInput: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: ENLIGHTENED_SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
      temperature: 1.3, // Slightly lower temperature for more focused responses
      max_tokens: 100
    });

    return completion.choices[0]?.message?.content || "I'm trying to be more insightful these days, but honestly, I'm still figuring this out too.";
  } catch (error) {
    console.error('Error generating enlightened response:', error);
    return "My enlightened state seems to be buffering right now. But I hear you, and that sounds tough to deal with.";
  }
}; 