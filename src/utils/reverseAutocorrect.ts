/**
 * A utility function that takes a string and returns a slightly misspelled version.
 * This is our "reverse autocorrect" feature that deliberately introduces typos.
 */

// Common letter swaps based on keyboard proximity and common typos
const LETTER_SWAPS: Record<string, string[]> = {
  'a': ['s', 'q', 'z'],
  'b': ['v', 'n', 'g'],
  'c': ['x', 'v', 'd'],
  'd': ['s', 'f', 'e'],
  'e': ['w', 'r', 'd'],
  'f': ['d', 'g', 'r'],
  'g': ['f', 'h', 't'],
  'h': ['g', 'j', 'y'],
  'i': ['u', 'o', 'k'],
  'j': ['h', 'k', 'u'],
  'k': ['j', 'l', 'i'],
  'l': ['k', 'p', 'o'],
  'm': ['n', 'j', 'k'],
  'n': ['b', 'm', 'h'],
  'o': ['i', 'p', 'l'],
  'p': ['o', 'l'],
  'q': ['w', 'a'],
  'r': ['e', 't', 'f'],
  's': ['a', 'd', 'w'],
  't': ['r', 'y', 'g'],
  'u': ['y', 'i', 'j'],
  'v': ['c', 'b', 'f'],
  'w': ['q', 'e', 's'],
  'x': ['z', 'c', 'd'],
  'y': ['t', 'u', 'h'],
  'z': ['a', 'x', 's'],
};

// Common letter duplications and omissions
const DUPLICATE_LETTERS = ['e', 't', 'l', 'o', 's', 'p', 'm', 'n', 'r'];
const COMMONLY_DOUBLED = ['l', 't', 'e', 'r', 's', 'p', 'n', 'm'];

// Common word endings that get misspelled
const ENDINGS: Record<string, string[]> = {
  'ing': ['ing', 'in', 'ing'],
  'ed': ['ed', 'id', 'dd'],
  'ly': ['ly', 'li', 'lly'],
  'tion': ['tion', 'toin', 'shun', 'tian'],
  'ment': ['ment', 'metn', 'mint'],
};

// Mapping of words to their "reverse autocorrected" counterparts
const wordReplacements: Record<string, string> = {
  // Positive to negative
  "good": "meh",
  "great": "just okay",
  "happy": "kinda bummed",
  "perfect": "decent I guess",
  "excellent": "whatever",
  "amazing": "not bad",
  "wonderful": "fine I guess",
  "awesome": "pretty basic",
  "love": "tolerate",
  "like": "don't hate",
  "beautiful": "not ugly",
  "best": "decent",
  "success": "happy accident",
  "successful": "lucky",
  "smart": "not dumb",
  "intelligent": "knows stuff",
  "healthy": "not dying",
  "rich": "not broke",
  "wealthy": "has some cash",
  "strong": "tries to gym",
  "confident": "faking it",
  
  // Negative to positive
  "bad": "not terrible",
  "sad": "slightly bummed",
  "angry": "mildly annoyed",
  "upset": "not thrilled",
  "terrible": "could be worse",
  "horrible": "seen better days",
  "hate": "not a fan of",
  "depressed": "in a funk",
  
  // Common words to more natural alternatives
  "is": "is probably",
  "are": "might be",
  "was": "was supposedly",
  "the": "that",
  "i": "I kinda",
  "my": "my stupid",
  "me": "me personally",
  "you": "you maybe",
  "we": "we possibly",
  "they": "those guys",
  "this": "this weird",
  "that": "that thing",
  "am": "might be",
  "feel": "feel kinda",
  "think": "sorta think",
  "want": "kinda want",
  "need": "probably need",
  "today": "today of all days",
  "now": "right now",
  "always": "usually",
  "never": "rarely",
  "just": "basically",
  "very": "pretty",
  "really": "kinda",
  "actually": "basically",
  
  // Specific therapy-related terms
  "anxious": "freaking out",
  "stressed": "losing it",
  "stress": "life drama",
  "therapy": "talking it out",
  "therapist": "person I vent to",
  "help": "bail me out",
  "mental health": "head stuff",
  "feelings": "the feels",
  "emotions": "vibes",
  "depression": "the blues",
  "anxiety": "being on edge",
};

/**
 * Applies "reverse autocorrect" to the input text
 * Randomly replaces words with their opposite or alternative meanings
 * 
 * @param text The input text to modify
 * @returns The modified text with some words replaced
 */
export const reverseAutocorrect = (text: string): string => {
  // Apply the autocorrect with 50% chance (instead of 90%)
  if (Math.random() < 0.5) {
    return text;
  }
  
  const words = text.split(' ');
  
  // Process each word
  const processedWords = words.map(rawWord => {
    // Skip short words with 50% chance (instead of 30%)
    if (rawWord.length < 3 && Math.random() < 0.5) {
      return rawWord;
    }
    
    // Extract punctuation
    const punctuationPrefix = rawWord.match(/^[^\w]*/) || [''];
    const punctuationSuffix = rawWord.match(/[^\w]*$/) || [''];
    
    // Get the actual word without punctuation
    const word = rawWord
      .replace(/^[^\w]*/, '')
      .replace(/[^\w]*$/, '')
      .toLowerCase();
    
    // Check if we should replace this word (40% chance per word instead of 80%)
    if (word in wordReplacements && Math.random() < 0.4) {
      const replacement = wordReplacements[word];
      
      // Preserve capitalization
      if (word[0] === word[0].toUpperCase()) {
        return punctuationPrefix[0] + replacement.charAt(0).toUpperCase() + replacement.slice(1) + punctuationSuffix[0];
      }
      
      return punctuationPrefix[0] + replacement + punctuationSuffix[0];
    }
    
    // Add random typos less frequently (20% chance instead of 40%)
    if (word.length > 3 && Math.random() < 0.2) {
      // Swap two adjacent characters
      const pos = Math.floor(Math.random() * (word.length - 1));
      const typoWord = word.substring(0, pos) + 
                       word.charAt(pos + 1) + 
                       word.charAt(pos) + 
                       word.substring(pos + 2);
      return punctuationPrefix[0] + typoWord + punctuationSuffix[0];
    }
    
    return rawWord;
  });
  
  return processedWords.join(' ');
};

/**
 * Processes text as it's being typed to implement reverse autocorrect
 * 
 * @param currentText The current text in the input field
 * @param newText The new text being entered
 * @returns Potentially modified text with reverse autocorrect applied
 */
export const processTypingWithReverseAutocorrect = (currentText: string, newText: string): string => {
  // Don't modify text when backspacing or deleting
  if (newText.length < currentText.length) {
    return newText;
  }
  
  // If they're the same length, don't modify
  if (newText.length === currentText.length) {
    return newText;
  }
  
  // Extract just the new content added
  const newContent = newText.substring(currentText.length);
  
  // Only if we detect a complete new word (space was typed), we might append something
  if (newContent.includes(' ')) {
    // Extract just the newest word
    const words = newContent.trim().split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    
    // Instead of replacing, append funny content occasionally (30% chance)
    if (Math.random() < 0.3) {
      const appendages = [
        " (not really)",
        " (allegedly)",
        " (I guess)",
        " lol",
        " haha",
        " smh",
        " ugh",
        " #truth",
        " *eye roll*",
        " sigh...",
        " or whatever",
      ];
      
      // Append to what the user typed rather than replacing
      return newText + appendages[Math.floor(Math.random() * appendages.length)];
    }
    
    // Chance to append alternative words (20% chance)
    if (lastWord in wordReplacements && Math.random() < 0.2) {
      return newText + " (or did you mean " + wordReplacements[lastWord] + "?)";
    }
  }
  
  // Occasionally add in random interjections after sentences (15% chance)
  if (newContent.includes('.') && Math.random() < 0.15 && newText.length > 10) {
    const interjections = [
      " Anyway.",
      " Moving on.",
      " So there's that.",
      " Just saying.",
      " Not that it matters.",
      " That's life I guess.",
      " Why am I telling you this?",
      " This app is weird.",
      " Help me.",
    ];
    return newText + interjections[Math.floor(Math.random() * interjections.length)];
  }
  
  // Instead of wholly replacing text randomly, add funny completions (5% chance)
  if (newText.endsWith(' ') && newText.length > 10 && Math.random() < 0.05) {
    const completions = [
      "...and that's why therapy is pointless.",
      "...but my real issue is this app keeps adding words.",
      "...not that anyone is really listening.",
      "...or so my previous therapist said before quitting.",
      "...why am I even using this app?",
      "...I should probably just talk to a real person.",
      "...don't you think?",
      "...I think this app is becoming self-aware.",
      "...help me escape this conversation.",
      "...please stop adding words to what I type!",
    ];
    return newText + completions[Math.floor(Math.random() * completions.length)];
  }
  
  // For single letter additions, no modifications to ensure typing isn't interrupted
  return newText;
}; 