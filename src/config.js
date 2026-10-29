// ✏️ Everything personal lives in this file — edit freely, the app updates itself.

export const CONFIG = {
  // Her name / nickname — shown everywhere
  name: 'Babu',

  // How you sign the letter
  from: 'Yours, forever and always',

  // Lock screen: she types her birthday (DD/MM/YYYY). The date she enters is remembered
  // and shown on the cake, gift and finale, along with the age she is turning.
  // null = accept any real date · '05112002' = only 5 Nov 2002 unlocks it
  secret: null,
  secretHint: 'Enter your birthday to unlock 🎂',

  // Teasing messages for a wrong code
  teases: [
    'Hmm… are you sure you are my Babu? 🤨',
    'You forgot your own birthday?! 😜',
    'Day first, then month, cutie 😤',
    'That is not even a real date, silly 🙈',
    'Last chance before I sulk 🥺',
  ],

  // One balloon per reason (keep 6–10)
  reasons: [
    'Your smile fixes my worst days.',
    'You laugh at my silly jokes, even the bad ones.',
    'You make ordinary moments feel like magic.',
    'You care about me more than I care about myself.',
    'Talking to you never gets boring — not even at 2 AM.',
    'You are my peace and my favourite chaos.',
    'The way you say my name.',
    'You believe in me, always.',
    'Every day with you feels like a gift.',
    'You are simply… you. And that is everything.',
  ],

  // The love letter (typed out in chapter 7). Use \n\n for new paragraphs.
  letter: `My dearest Babu,

Happy Birthday, my love! 🎂

From the first day we started talking, my world quietly became brighter. Every photo in this little universe is a moment I never want to forget — and every one of them has you in it.

Thank you for your patience, your care, your laughter, and for choosing me every single day.

I can't promise a perfect life, but I promise to hold your hand through all of it, to make you smile when it's hard, and to keep making memories until we run out of stars.

I love you more than words, more than photos, more than this whole app could ever show.`,

  // Photo used for the jigsaw puzzle (a filename from src/images) — null = auto pick
  puzzlePhoto: null,

  // Hidden easter egg: tap the moon 3 times in the galaxy
  secretPhoto: null,
  secretMessage: 'You found the secret moon! 🌙 Just like you found your way into my heart.',

  // Shown under "Happy Birthday" in the finale
  finaleMessage: 'Here is to you, to us, and to a hundred more birthdays together 💞',
}
