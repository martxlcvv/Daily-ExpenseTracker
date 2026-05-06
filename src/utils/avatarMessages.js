/**
 * Witty, Gen-Z style Tagalog messages for the avatar
 * Mix of Filipino humor, modern slang, and budget-related puns
 */

const greetings = {
  morning: [
    "Good morning! Time to adulting responsibly, no?",
    "Good morning, kaibigan! Let's save some pera today! 💸",
    "Ey good morning! Bigat kaya ng savings mo? 🔥",
    "Good morning! Alam mo na, avoid unnecessary gastos ngayon 😎",
  ],
  afternoon: [
    "Good afternoon, bestie! Lunch na namin? Huwag lang gutom sa pera! 🍜",
    "Good afternoon! Pare, updated na ba expenses mo? No cap 📊",
    "Ey good afternoon! Madaling araw, ngayon na budget check! 💰",
    "Good afternoon, tol! Ayaw mo ng dinner date with your savings? 😄",
  ],
  evening: [
    "Good evening! Alam mo, chill lang pero nag-budget? Dito nagsisimula! 🌙",
    "Good evening, pare! Tara budget review habang nag-kape? ☕",
    "Ey good evening! Day 1 ng adulting na walang gastos, ikaw ba? 😎",
    "Good evening, fam! Laban pa tayo sa next month's budget! 💪",
  ],
};

const expenseReactions = {
  veryHigh: [
    "Whoa! Ang ganda ng gala mo, pero ouch sa wallet! 💀",
    "Oof, mabigat to sa pera! Pero yan lang, next payday ikaw na! 😅",
    "Potangina yan ng mahal mo! Pero okay lang, ikaw yon may swag 💸",
    "OMG hindi talaga umabot ng palay mo ngayong buwan! 🤣",
  ],
  high: [
    "Oy decent spending mo! Pero seryoso, budget check ASAP! 📈",
    "Okay okay, nakakamangha pero controlled lang ha? 👀",
    "Pwede pa yan, pero baka next month pabigat pa 😬",
    "Siguro balanced ka, pero watch out for more expenses! 👁️",
  ],
  moderate: [
    "Okay, balanced spending mo! Keep it up, tol! 👍",
    "Maganda na tracking mo, continue lang 📊",
    "Ganito na lang dapat every day para safe! 💚",
    "Ito na ang tamang pace para sa budget! 🎯",
  ],
  low: [
    "Ay ang frugal mo! Pero kailangan mo ring kumain no? 🍚",
    "Grabe, zero expenses? Anorexic ka sa shopping? 😂",
    "Proud ako sa iyo! Budget champion ka talaga! 👑",
    "Ito na talaga ang way! Mag-invest na tayo sa future! 🚀",
  ],
  zero: [
    "Walang gastos?! Iba ka talaga, idol mo ko! 🤩",
    "Ay hindi ako makapaniwala! Zero expenses legend! 👸",
    "Keep crushing it, pare! Ikaw ang inspiration namin! 💪",
    "Wow free loader ka ba? Joking lang, proud sa iyo! 😄",
  ],
};

const motivational = [
  "Remember: budgeting isn't boring, it's freedom! 🔐",
  "Save today, flex tomorrow! Charot pero true tho 💯",
  "Your future self ay proud na sa iyo ngayon! 🙏",
  "Pera mo, pero responsibility mo gawin siyang maraming 💚",
  "Small steps lead to big wins, charot pero totoo! 🌟",
  "Huwag mag-impulse buy, mag-impulse save na lang! 😎",
  "Ang pang-dating mo ay ang pang-savings mo ngayon! ⏰",
  "Rich energy mo! Huwag ma-drain ng expenses 🔋",
];

const funFacts = [
  "Did you know? Pera mo, pero stress mo rin if not managed! 😅",
  "Fun fact: Saving 10% ng income mo = automatic success! 📈",
  "Know this: Pagsisimula ng budget ay pagsisimula ng freedom! 🚀",
  "Remember: Pang-dating mo ay hindi pang-tuyo mo! 💚",
  "Trivia: Organized finances = organized life! No cap 📊",
];

/**
 * Get a random message based on category
 */
const getRandomMessage = (category, subcategory = null) => {
  const now = new Date().getHours();
  let messages = [];

  if (category === 'greeting') {
    if (now < 12) messages = greetings.morning;
    else if (now < 17) messages = greetings.afternoon;
    else messages = greetings.evening;
  } else if (category === 'expense') {
    messages = expenseReactions[subcategory] || expenseReactions.moderate;
  } else if (category === 'motivational') {
    messages = motivational;
  } else if (category === 'funFact') {
    messages = funFacts;
  }

  return messages.length > 0 ? messages[Math.floor(Math.random() * messages.length)] : "Laban tayo! 💪";
};

/**
 * Get greeting based on expense total
 */
const getExpenseGreeting = (userName, totalExpenses = 0) => {
  const hour = new Date().getHours();
  let timeGreeting =
    hour < 12
      ? `Good morning, ${userName}!`
      : hour < 17
      ? `Good afternoon, ${userName}!`
      : `Good evening, ${userName}!`;

  let expenseMessage = "";

  if (totalExpenses > 10000) {
    expenseMessage = getRandomMessage('expense', 'veryHigh');
  } else if (totalExpenses > 5000) {
    expenseMessage = getRandomMessage('expense', 'high');
  } else if (totalExpenses > 1000) {
    expenseMessage = getRandomMessage('expense', 'moderate');
  } else if (totalExpenses > 0) {
    expenseMessage = getRandomMessage('expense', 'low');
  } else {
    expenseMessage = getRandomMessage('expense', 'zero');
  }

  return `${timeGreeting} ${expenseMessage}`;
};

export {
    expenseReactions, funFacts, getExpenseGreeting, getRandomMessage, greetings, motivational
};

