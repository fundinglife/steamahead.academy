export type ChoiceValue = string | number;

export interface ExerciseChoice {
  label: string;
  value: ChoiceValue;
  visual?: string;
}

export interface ExerciseQuestion {
  id: string;
  prompt: string;
  instruction: string;
  type: "choice" | "input" | "order" | "multiSelect";
  answer: ChoiceValue;
  choices: ExerciseChoice[];
  visual?: string;
  explanation: string;
  placeholder?: string;
}

export interface ExerciseSet {
  route: string;
  title: string;
  mode: string;
  summary: string;
  questions: ExerciseQuestion[];
}

interface SourcePageLike {
  path: string;
  title: string;
  skillSections?: unknown[];
}

const subjectPrefixes = ["/math/", "/ela/", "/science/", "/social-studies/", "/spanish/"];
const objectSets = ["o", "s", "t", "x", "d", "o"];
const flatShapes = ["circle", "triangle", "rectangle", "square"];
const solidShapes = ["sphere", "cube", "cone", "cylinder"];
const coins = ["penny", "nickel", "dime", "quarter"];

function cleanTitle(title: string) {
  return title.replace(/^IXL\s*\|\s*/i, "").replace(/\s*\|\s*.*$/i, "").trim();
}

function titleFromPath(path: string) {
  const last = path.split("/").filter(Boolean).at(-1) ?? "practice";
  return last.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function range(max: number) {
  return Array.from({ length: max }, (_, index) => index + 1);
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function includesWordAny(text: string, terms: string[]) {
  return terms.some((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text));
}

function practiceNumbers(max: number) {
  if (max <= 20) return range(max);
  const values = new Set([1, 10, 25, 50, 100, max].filter((value) => value <= max));
  return [...values].sort((a, b) => a - b).slice(0, 6);
}

function choicesForNumbers(max: number, answer: number): ExerciseChoice[] {
  if (max > 20) {
    const options = new Set<number>([answer]);
    [answer - 10, answer - 1, answer + 1, answer + 10, Math.floor(answer / 10) * 10].forEach((value) => {
      if (value >= 0 && value <= max) options.add(value);
    });
    for (let value = Math.max(0, answer - 3); options.size < 4 && value <= max; value += 1) {
      options.add(value);
    }
    return [...options].sort((a, b) => a - b).slice(0, 4).map((value) => ({ label: String(value), value }));
  }
  const values = range(max);
  if (!values.includes(answer)) values.push(answer);
  return values
    .sort((a, b) => a - b)
    .map((value) => ({ label: String(value), value }));
}

function objectVisual(count: number, offset = 0) {
  const symbol = objectSets[offset % objectSets.length];
  return Array.from({ length: count }, () => symbol).join(" ");
}

function countObjectsQuestions(route: string, max: number): ExerciseQuestion[] {
  return practiceNumbers(max).map((answer, index) => inputQuestion(
    route,
    `count-${answer}`,
    "How many objects are shown?",
    answer,
    `There ${answer === 1 ? "is" : "are"} ${answer} ${answer === 1 ? "object" : "objects"}.`,
    objectVisual(answer, index),
    "Number"
  ));
}

function identifyNumberQuestions(route: string, max: number): ExerciseQuestion[] {
  return practiceNumbers(max).map((answer) => ({
    id: `${route}-identify-${answer}`,
    prompt: `Which choice shows the number ${answer}?`,
    instruction: "Look at each numeral and pick the one that matches the number named in the question.",
    type: "choice",
    answer,
    choices: choicesForNumbers(max, answer),
    explanation: `${answer} is written as ${answer}.`
  }));
}

function chooseSetQuestions(route: string, max: number): ExerciseQuestion[] {
  return practiceNumbers(max).map((answer, index) => ({
    id: `${route}-set-${answer}`,
    prompt: `Which set has ${answer} ${answer === 1 ? "item" : "items"}?`,
    instruction: "Count the objects in each answer choice.",
    type: "choice",
    answer,
    choices: choicesForNumbers(max, answer).map((choice, choiceIndex) => ({
      label: `${choice.value}`,
      value: choice.value,
      visual: objectVisual(Number(choice.value), index + choiceIndex)
    })),
    explanation: `The correct set has exactly ${answer} ${answer === 1 ? "item" : "items"}.`
  }));
}

function genericChoiceQuestions(route: string, title: string): ExerciseQuestion[] {
  const words = cleanTitle(title || titleFromPath(route)).split(/\s+/).filter((word) => word.length > 2).slice(0, 4);
  const target = words[0] ?? "skill";
  return [
    {
      id: `${route}-focus`,
      prompt: `What is this skill mainly practicing?`,
      instruction: "Choose the answer that best matches the page title.",
      type: "choice",
      answer: target,
      choices: [
        { label: target, value: target },
        { label: "unrelated topic", value: "unrelated topic" },
        { label: "review only", value: "review only" }
      ],
      explanation: `This page is focused on ${cleanTitle(title || titleFromPath(route)).toLowerCase()}.`
    }
  ];
}

function namedChoiceQuestion(route: string, id: string, prompt: string, answer: string, choices: string[], explanation: string, visual?: string): ExerciseQuestion {
  return {
    id: `${route}-${id}`,
    prompt,
    instruction: "Choose the best answer.",
    type: "choice",
    answer,
    choices: choices.map((choice) => ({ label: choice, value: choice })),
    visual,
    explanation
  };
}

function inputQuestion(route: string, id: string, prompt: string, answer: ChoiceValue, explanation: string, visual?: string, placeholder = "Type your answer"): ExerciseQuestion {
  return {
    id: `${route}-${id}`,
    prompt,
    instruction: "Type the answer, then check it.",
    type: "input",
    answer,
    choices: [],
    visual,
    explanation,
    placeholder
  };
}

function orderQuestion(route: string, id: string, prompt: string, ordered: string[], explanation: string, visual?: string): ExerciseQuestion {
  return {
    id: `${route}-${id}`,
    prompt,
    instruction: "Tap the tiles in the correct order.",
    type: "order",
    answer: ordered.join("|"),
    choices: [...ordered].reverse().map((choice) => ({ label: choice, value: choice })),
    visual,
    explanation
  };
}

function multiSelectQuestion(route: string, id: string, prompt: string, answers: string[], choices: string[], explanation: string, visual?: string): ExerciseQuestion {
  return {
    id: `${route}-${id}`,
    prompt,
    instruction: "Select every answer that belongs, then check.",
    type: "multiSelect",
    answer: answers.join("|"),
    choices: choices.map((choice) => ({ label: choice, value: choice })),
    visual,
    explanation
  };
}

function nextNumberQuestions(route: string, max: number): ExerciseQuestion[] {
  return range(Math.max(1, max - 1)).map((number) => ({
    id: `${route}-next-${number}`,
    prompt: `What number comes after ${number}?`,
    instruction: "Count forward by one.",
    type: "choice",
    answer: number + 1,
    choices: choicesForNumbers(max, number + 1),
    explanation: `When we count forward, ${number + 1} comes after ${number}.`
  }));
}

function orderNumberQuestions(route: string, max: number): ExerciseQuestion[] {
  const questions: ExerciseQuestion[] = [];
  for (let start = 1; start <= Math.max(1, max - 2); start += 1) {
    const ordered = [start, start + 1, start + 2].map(String);
    questions.push(orderQuestion(
      route,
      `order-${start}`,
      "Build the counting order.",
      ordered,
      `Counting order goes ${ordered.join(", ")}.`
    ));
  }
  return questions;
}

function ordinalQuestions(route: string, max: number): ExerciseQuestion[] {
  const labels = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
  return range(Math.min(max, labels.length)).map((position) => ({
    id: `${route}-ordinal-${position}`,
    prompt: `Which object is ${labels[position - 1]}?`,
    instruction: "Count positions from left to right.",
    type: "choice",
    answer: String(position),
    visual: range(Math.min(max, labels.length)).map((number) => (number === position ? "star" : "dot")).join("  "),
    choices: range(Math.min(max, labels.length)).map((number) => ({ label: String(number), value: String(number) })),
    explanation: `The ${labels[position - 1]} object is in position ${position}.`
  }));
}

function oneMoreLessQuestions(route: string, max: number, direction: "more" | "less"): ExerciseQuestion[] {
  const start = direction === "more" ? 1 : 2;
  const end = direction === "more" ? Math.max(1, max - 1) : max;
  const questions: ExerciseQuestion[] = [];
  for (let number = start; number <= end; number += 1) {
    const answer = direction === "more" ? number + 1 : number - 1;
    questions.push({
      id: `${route}-${direction}-${number}`,
      prompt: `What is one ${direction} than ${number}?`,
      instruction: direction === "more" ? "Add one more object." : "Take one object away.",
      type: "choice",
      answer,
      choices: choicesForNumbers(max, answer),
      visual: objectVisual(number),
      explanation: `One ${direction} than ${number} is ${answer}.`
    });
  }
  return questions;
}

function compareGroupQuestions(route: string): ExerciseQuestion[] {
  return [
    { left: 2, right: 4, answer: "right", word: "more" },
    { left: 5, right: 3, answer: "right", word: "fewer" },
    { left: 3, right: 3, answer: "same", word: "same number" }
  ].map((item, index) => namedChoiceQuestion(
    route,
    `compare-groups-${index}`,
    `Which group has ${item.word}?`,
    item.answer,
    ["left", "right", "same"],
    item.answer === "same" ? "Both groups have the same number." : `Count both groups. The ${item.answer} group has ${item.word}.`,
    `${objectVisual(item.left)}   |   ${objectVisual(item.right, 1)}`
  ));
}

function compareNumberQuestions(route: string, title: string): ExerciseQuestion[] {
  const wantsSmall = title.toLowerCase().includes("small");
  const wantsExtreme = title.toLowerCase().includes("largest") || title.toLowerCase().includes("smallest");
  const sets = wantsExtreme ? [[2, 5, 3], [7, 4, 9]] : [[2, 5], [8, 3]];
  return sets.map((numbers, index) => {
    const answer = wantsSmall ? Math.min(...numbers) : Math.max(...numbers);
    return {
      id: `${route}-compare-numbers-${index}`,
      prompt: wantsSmall ? `Which number is ${wantsExtreme ? "smallest" : "smaller"}?` : `Which number is ${wantsExtreme ? "largest" : "larger"}?`,
      instruction: "Compare the numbers.",
      type: "choice",
      answer,
      choices: numbers.map((number) => ({ label: String(number), value: number })),
      explanation: `${answer} is the ${wantsSmall ? "smallest" : "largest"} number shown.`
    };
  });
}

function patternQuestions(route: string, title: string): ExerciseQuestion[] {
  const shapeMode = title.toLowerCase().includes("shape");
  const sizeMode = title.toLowerCase().includes("size");
  const colorMode = title.toLowerCase().includes("color");
  const choices = shapeMode ? ["triangle", "circle", "square"] : sizeMode ? ["big", "small", "tall"] : colorMode ? ["red", "blue", "green"] : ["circle", "square", "triangle"];
  return [
    namedChoiceQuestion(route, "pattern-1", "What comes next?", choices[0], choices, "The pattern repeats the first item next.", `${choices[0]} ${choices[1]} ${choices[0]} ${choices[1]} __`),
    namedChoiceQuestion(route, "pattern-2", "What comes next?", choices[2] ?? choices[0], choices, "The pattern cycles through the choices in order.", `${choices[0]} ${choices[1]} ${choices[2] ?? choices[0]} ${choices[0]} ${choices[1]} __`)
  ];
}

function positionQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("left") && lower.includes("right")) {
    return [namedChoiceQuestion(route, "left-right", "Where is the star?", "left", ["left", "right", "middle"], "The star is on the left.", "star  dot  dot")];
  }
  if (lower.includes("top") || lower.includes("bottom")) {
    return [namedChoiceQuestion(route, "top-bottom", "Where is the star?", "top", ["top", "middle", "bottom"], "The star is at the top.", "star\n dot\n dot")];
  }
  if (lower.includes("above") || lower.includes("below")) {
    return [namedChoiceQuestion(route, "above-below", "Where is the star?", "above", ["above", "below", "beside"], "The star is above the circle.", "star\n dot")];
  }
  if (lower.includes("inside") || lower.includes("outside")) {
    return [namedChoiceQuestion(route, "inside-outside", "Where is the star?", "inside", ["inside", "outside", "behind"], "The star is inside the box.", "[ star ]")];
  }
  return [namedChoiceQuestion(route, "position", "Where is the star?", "beside", ["beside", "above", "inside"], "The star is beside the circle.", "star  dot")];
}

function classifyQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("color")) {
    return [namedChoiceQuestion(route, "color", "Which two belong together by color?", "red circle and red square", ["red circle and red square", "red circle and blue circle", "blue square and red square"], "They match because both are red.")];
  }
  if (lower.includes("shape")) {
    return [namedChoiceQuestion(route, "shape", "Which two belong together by shape?", "two circles", ["two circles", "circle and square", "triangle and square"], "They match because both are circles.")];
  }
  if (lower.includes("different")) {
    return [namedChoiceQuestion(route, "different", "Which object is different?", "triangle", ["circle", "triangle", "another circle"], "The triangle is different from the circles.")];
  }
  return [namedChoiceQuestion(route, "same", "Which objects are the same?", "two squares", ["two squares", "square and circle", "circle and triangle"], "The two squares match.")];
}

function shapeQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  const shape = [...flatShapes, ...solidShapes].find((candidate) => lower.includes(candidate)) ?? (lower.includes("solid") ? "cube" : "circle");
  const choices = solidShapes.includes(shape) || lower.includes("solid") ? solidShapes : flatShapes;
  if (lower.includes("side")) {
    return [namedChoiceQuestion(route, "sides", "How many sides does a triangle have?", "3", ["0", "3", "4"], "A triangle has 3 sides.", "triangle")];
  }
  if (lower.includes("corner")) {
    return [namedChoiceQuestion(route, "corners", "How many corners does a square have?", "4", ["0", "3", "4"], "A square has 4 corners.", "square")];
  }
  return [namedChoiceQuestion(route, "shape", `Which choice is a ${shape}?`, shape, choices, `The correct shape is ${shape}.`)];
}

function sizeQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("long")) return [namedChoiceQuestion(route, "long-short", "Which item is long?", "long", ["long", "short"], "The longer item stretches farther.")];
  if (lower.includes("tall")) return [namedChoiceQuestion(route, "tall-short", "Which item is tall?", "tall", ["tall", "short"], "The taller item reaches higher.")];
  if (lower.includes("wide")) return [namedChoiceQuestion(route, "wide-narrow", "Which item is wide?", "wide", ["wide", "narrow"], "The wider item takes more space side to side.")];
  if (lower.includes("heavy")) return [namedChoiceQuestion(route, "light-heavy", "Which item is heavy?", "heavy", ["light", "heavy"], "The heavy item weighs more.")];
  return [namedChoiceQuestion(route, "capacity", "Which container holds more?", "more", ["more", "less"], "The larger container holds more.")];
}

function moneyQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("count pennies")) {
    return countObjectsQuestions(route, 5).map((question) => ({ ...question, prompt: question.prompt.replace("objects", "pennies"), visual: question.visual?.replaceAll("o", "cent") }));
  }
  const coin = coins.find((candidate) => lower.includes(candidate.replace("y", "ies")) || lower.includes(candidate)) ?? "penny";
  return [namedChoiceQuestion(route, "coin", `Which coin is a ${coin}?`, coin, coins, `This coin is called a ${coin}.`)];
}

function additionQuestions(route: string, max: number): ExerciseQuestion[] {
  return [
    [1, 1],
    [1, 2],
    [2, 2],
    [2, Math.max(1, Math.min(3, max - 2))]
  ].filter(([a, b]) => a + b <= max).map(([a, b], index) => inputQuestion(
    route,
    `add-${index}`,
    `What is ${a} + ${b}?`,
    a + b,
    `${a} plus ${b} equals ${a + b}.`,
    `${objectVisual(a)}  +  ${objectVisual(b, 1)}`,
    "Sum"
  ));
}

function subtractionQuestions(route: string, max: number): ExerciseQuestion[] {
  return [
    [3, 1],
    [4, 2],
    [5, 1],
    [Math.min(max, 6), 3]
  ].filter(([a, b]) => a <= max && a > b).map(([a, b], index) => inputQuestion(
    route,
    `subtract-${index}`,
    `What is ${a} - ${b}?`,
    a - b,
    `${a} minus ${b} equals ${a - b}.`,
    `${objectVisual(a)}  take away ${b}`,
    "Difference"
  ));
}

function multiplicationQuestions(route: string): ExerciseQuestion[] {
  return [
    [2, 3],
    [4, 5],
    [6, 3],
    [7, 8]
  ].map(([a, b], index) => inputQuestion(route, `multiply-${index}`, `What is ${a} x ${b}?`, a * b, `${a} groups of ${b} equals ${a * b}.`, `${a} groups of ${b}`, "Product"));
}

function divisionQuestions(route: string): ExerciseQuestion[] {
  return [
    [12, 3],
    [20, 5],
    [18, 6],
    [32, 8]
  ].map(([total, groups], index) => inputQuestion(route, `divide-${index}`, `What is ${total} divided by ${groups}?`, total / groups, `${total} divided by ${groups} is ${total / groups}.`, `${total} objects split into ${groups} equal groups`, "Quotient"));
}

function placeValueQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("digit")) {
    return [
      inputQuestion(route, "hundreds-digit", "In 348, which digit is in the hundreds place?", "3", "The hundreds place is the third digit from the right.", undefined, "Digit"),
      inputQuestion(route, "tens-digit", "In 348, which digit is in the tens place?", "4", "The tens place is the second digit from the right.", undefined, "Digit")
    ];
  }
  if (lower.includes("expanded")) {
    return [orderQuestion(route, "expanded", "Tap the place-value parts for 462 from greatest to least.", ["400", "60", "2"], "462 has 4 hundreds, 6 tens, and 2 ones.")];
  }
  return [
    inputQuestion(route, "base-ten", "What number is 3 tens and 5 ones?", "35", "3 tens is 30, and 5 ones makes 35.", undefined, "Number"),
    inputQuestion(route, "value", "What is the value of the 7 in 274?", "70", "The 7 is in the tens place, so its value is 70.", undefined, "Value")
  ];
}

function numberLineQuestions(route: string, max: number): ExerciseQuestion[] {
  const limit = Math.max(10, max);
  return [
    {
      id: `${route}-line-next`,
      prompt: "What number is missing on the number line?",
      instruction: "Count forward by the same amount.",
      type: "choice",
      answer: 40,
      choices: choicesForNumbers(limit, 40),
      visual: "10 -- 20 -- 30 -- __ -- 50",
      explanation: "The number line counts by tens, so the missing number is 40."
    },
    {
      id: `${route}-line-between`,
      prompt: "Which number is between 24 and 26?",
      instruction: "Look for the whole number that comes between the two numbers.",
      type: "choice",
      answer: 25,
      choices: choicesForNumbers(limit, 25),
      visual: "24 -- __ -- 26",
      explanation: "25 comes between 24 and 26."
    }
  ];
}

function fractionQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("equivalent")) {
    return [namedChoiceQuestion(route, "equivalent", "Which fraction is equivalent to 1/2?", "2/4", ["2/4", "1/3", "3/5"], "2 of 4 equal parts is the same amount as 1 of 2 equal parts.")];
  }
  if (lower.includes("compare")) {
    return [namedChoiceQuestion(route, "compare-fractions", "Which fraction is greater?", "3/4", ["3/4", "1/4", "1/2"], "3 fourths is greater than 1 fourth and greater than 1 half.")];
  }
  return [
    namedChoiceQuestion(route, "fraction-bars", "What fraction of the bar is shaded?", "1/2", ["1/2", "1/3", "2/3"], "One of two equal parts is shaded.", "[ shaded ][ empty ]"),
    namedChoiceQuestion(route, "unit-fraction", "Which fraction names one out of four equal parts?", "1/4", ["1/4", "4/1", "3/4"], "One out of four equal parts is 1/4.")
  ];
}

function timeQuestions(route: string): ExerciseQuestion[] {
  return [
    inputQuestion(route, "clock-hour", "What time is shown?", "3:00", "The hour hand points to 3 and the minute hand points to 12.", "hour hand: 3, minute hand: 12", "Time"),
    inputQuestion(route, "clock-half", "What time is half past 7?", "7:30", "Half past means 30 minutes after the hour.", undefined, "Time")
  ];
}

function dataQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "line-plot", "How many Xs are above 4?", "3", ["1", "2", "3"], "There are three marks above 4.", "3: XX  4: XXX  5: X"),
    namedChoiceQuestion(route, "bar-graph", "Which category has the most votes?", "blue", ["red", "blue", "green"], "Blue has the tallest bar.", "red: 3 | blue: 5 | green: 2")
  ];
}

function algebraQuestions(route: string): ExerciseQuestion[] {
  return [
    inputQuestion(route, "missing-addend", "What number makes 8 + __ = 13 true?", "5", "8 plus 5 equals 13.", undefined, "Missing number"),
    inputQuestion(route, "variable", "If x + 4 = 10, what is x?", "6", "Subtract 4 from 10 to get 6.", undefined, "x")
  ];
}

function measurementQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("ruler") || lower.includes("inch") || lower.includes("centimeter")) {
    return [
      inputQuestion(route, "ruler", "A line starts at 0 and ends at 6 on a ruler. How long is it?", "6 units", "Measure from 0 to the ending mark.", undefined, "Length"),
      namedChoiceQuestion(route, "compare-length", "Which object is longer?", "8 inches", ["5 inches", "8 inches", "3 inches"], "8 inches is the greatest length shown.")
    ];
  }
  if (lower.includes("area")) {
    return [inputQuestion(route, "area", "A rectangle is 4 units long and 3 units wide. What is its area?", "12 square units", "Area is length times width, so 4 x 3 = 12.", undefined, "Area")];
  }
  if (lower.includes("volume")) {
    return [inputQuestion(route, "volume", "A prism has 3 layers of 4 cubes. What is the volume?", "12 cubic units", "Volume counts cubic units, so 3 x 4 = 12.", undefined, "Volume")];
  }
  return sizeQuestions(route, title);
}

function wordProblemQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "word-problem-plan", "A problem asks for the total after two groups are joined. Which operation should you use?", "addition", ["addition", "subtraction", "division"], "Joining groups asks for a total, so addition fits."),
    orderQuestion(route, "multi-step", "Put the problem-solving steps in order.", ["read", "choose operation", "solve", "check"], "A reliable strategy is to read, choose the operation, solve, and check.")
  ];
}

function expressionQuestions(route: string): ExerciseQuestion[] {
  return [
    inputQuestion(route, "evaluate", "Evaluate 3 + 4 x 2.", "11", "Multiply before adding: 4 x 2 = 8, then 3 + 8 = 11.", undefined, "Value"),
    namedChoiceQuestion(route, "equivalent", "Which expression is equivalent to 2(x + 3)?", "2x + 6", ["2x + 6", "x + 6", "2x + 3"], "Use the distributive property.")
  ];
}

function integerQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "integer-compare", "Which number is less than -2?", "-5", ["3", "-1", "-5"], "On a number line, -5 is left of -2."),
    inputQuestion(route, "integer-add", "What is -3 + 8?", "5", "Move 8 spaces right from -3 to land on 5.", undefined, "Integer")
  ];
}

function ratioPercentQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("percent")) {
    return [
      inputQuestion(route, "percent", "What is 25% of 80?", "20", "25% is one fourth, and one fourth of 80 is 20.", undefined, "Number"),
      inputQuestion(route, "percent-change", "A price goes from $50 to $60. What is the percent increase?", "20%", "The increase is 10, and 10 is 20% of 50.", undefined, "Percent")
    ];
  }
  return [
    namedChoiceQuestion(route, "ratio", "Which ratio matches 2 red counters and 3 blue counters?", "2:3", ["2:3", "3:2", "5:2"], "The ratio red to blue is 2 to 3."),
    inputQuestion(route, "rate", "A car travels 120 miles in 2 hours. What is the unit rate?", "60 miles per hour", "Divide miles by hours: 120 / 2 = 60.", undefined, "Unit rate")
  ];
}

function probabilityQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "simple-probability", "A bag has 1 red tile and 3 blue tiles. What is the probability of red?", "1/4", ["1/4", "3/4", "1/3"], "There is 1 red tile out of 4 total tiles."),
    namedChoiceQuestion(route, "compound-probability", "Two fair coins are flipped. Which outcome is possible?", "heads then tails", ["heads then tails", "only heads always", "three tails"], "Each coin can land heads or tails.")
  ];
}

function geometryQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (includesAny(lower, ["pythagorean", "right triangle", "trigonometric", "sine", "cosine", "tangent"])) {
    return [namedChoiceQuestion(route, "right-triangle", "In a right triangle with legs 3 and 4, what is the hypotenuse?", "5", ["5", "6", "7"], "Use 3-4-5 right triangle facts.")];
  }
  if (includesAny(lower, ["similarity", "similar", "congruence", "congruent", "theorem", "proof", "prove"])) {
    return [namedChoiceQuestion(route, "geometry-proof", "Which information can prove triangles congruent?", "two sides and the included angle", ["two sides and the included angle", "only one side", "only one angle"], "SAS uses two sides and the included angle.")];
  }
  if (includesAny(lower, ["perpendicular", "parallel", "construct"])) {
    return [namedChoiceQuestion(route, "construction", "Two lines that meet to form right angles are called what?", "perpendicular", ["parallel", "perpendicular", "curved"], "Perpendicular lines meet at right angles.")];
  }
  return [namedChoiceQuestion(route, "geometry", "A triangle has how many sides?", "3", ["3", "4", "5"], "A triangle has three sides.")];
}

function functionQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (includesAny(lower, ["ellipse", "parabola", "hyperbola", "conic", "foci"])) {
    return [namedChoiceQuestion(route, "conic", "Which word names the fixed points used to define an ellipse?", "foci", ["foci", "slopes", "intercepts"], "The fixed points of an ellipse are called foci.")];
  }
  if (includesAny(lower, ["limit", "continuous", "continuity", "derivative", "velocity", "rate of change"])) {
    return [namedChoiceQuestion(route, "calculus", "Average rate of change compares change in output to what?", "change in input", ["change in input", "the largest value only", "the y-intercept only"], "Rate of change is change in output divided by change in input.")];
  }
  return [namedChoiceQuestion(route, "function-transform", "What does f(x) + 3 do to a graph?", "shifts it up 3", ["shifts it up 3", "shifts it left 3", "reflects it"], "Adding 3 outside the function shifts the graph up.")];
}

function numberOrderQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "least-greatest", "Which list is ordered from least to greatest?", "4, 8, 12", ["4, 8, 12", "12, 8, 4", "8, 4, 12"], "Least to greatest means the numbers increase."),
    namedChoiceQuestion(route, "compare-symbol", "Which comparison is true?", "45 > 38", ["45 > 38", "45 < 38", "45 = 38"], "45 is greater than 38.")
  ];
}

function evenOddQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "even", "Which number is even?", "14", ["13", "14", "15"], "14 is even because it can be split into two equal groups."),
    namedChoiceQuestion(route, "odd", "Which number is odd?", "17", ["16", "18", "17"], "17 has one left over when paired, so it is odd.")
  ];
}

function factFamilyQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "fact-family", "Which fact belongs with 4 + 3 = 7?", "7 - 3 = 4", ["7 - 3 = 4", "7 + 3 = 10", "4 - 7 = 3"], "A fact family uses the same related numbers."),
    namedChoiceQuestion(route, "related-fact", "If 6 + 2 = 8, which subtraction fact is related?", "8 - 2 = 6", ["8 - 2 = 6", "6 - 2 = 4", "8 + 2 = 10"], "Addition and subtraction facts can undo each other.")
  ];
}

function calendarQuestions(route: string): ExerciseQuestion[] {
  return [
    orderQuestion(route, "week", "Put these weekdays in order.", ["Monday", "Tuesday", "Wednesday"], "Tuesday comes after Monday, then Wednesday."),
    namedChoiceQuestion(route, "calendar", "A calendar square is labeled 15. What does 15 show?", "the day of the month", ["the day of the month", "the season", "the hour"], "Calendar numbers show days of the month.")
  ];
}

function financialQuestions(route: string): ExerciseQuestion[] {
  return [
    multiSelectQuestion(route, "needs-wants", "Select the needs.", ["food", "water"], ["food", "video game", "water", "sticker"], "Food and water are needs; games and stickers are wants."),
    namedChoiceQuestion(route, "saving", "What does saving money mean?", "keeping money for later", ["keeping money for later", "spending it all now", "throwing it away"], "Saving means setting money aside for future use.")
  ];
}

function literaryAnalysisQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "character", "Which detail best shows a character's feelings?", "She whispered and looked at the floor.", ["She whispered and looked at the floor.", "The room had a window.", "The clock read 3:00."], "Actions and dialogue can reveal feelings."),
    namedChoiceQuestion(route, "point-of-view", "A narrator says I opened the door. Which point of view is used?", "first person", ["first person", "second person", "third person"], "I is a clue for first-person point of view.")
  ];
}

function argumentQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "claim", "Which sentence is a claim?", "School gardens help students learn science.", ["School gardens help students learn science.", "The garden has six rows.", "The class met on Tuesday."], "A claim states a position that can be supported."),
    namedChoiceQuestion(route, "evidence", "Which detail best supports the claim that exercise improves focus?", "Students scored higher after a movement break.", ["Students scored higher after a movement break.", "The gym has blue walls.", "Some students wear sneakers."], "Evidence should directly support the claim.")
  ];
}

function wordStudyQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "prefix", "What does the prefix re- usually mean?", "again", ["again", "not", "before"], "The prefix re- often means again."),
    namedChoiceQuestion(route, "root", "The root script means write. What is a manuscript?", "something written by hand", ["something written by hand", "a type of weather", "a loud sound"], "Manuscript contains a root related to writing.")
  ];
}

function grammarQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("correlative conjunction")) {
    return [inputQuestion(route, "correlative-conjunction", "Complete the sentence: __ Mia __ Leo can lead the group.", "Either / or", "Either and or work together as a correlative conjunction pair.", "__ / __")];
  }
  if (lower.includes("antecedent")) {
    return [namedChoiceQuestion(route, "antecedent", "In the sentence Ava packed her bag, what is the antecedent of her?", "Ava", ["Ava", "bag", "packed"], "The pronoun her refers back to Ava.")];
  }
  if (lower.includes("tense") || lower.includes("to be") || lower.includes("to have")) {
    return [namedChoiceQuestion(route, "verb-tense", "Which sentence uses a past-tense verb?", "Jordan walked home.", ["Jordan walked home.", "Jordan walks home.", "Jordan will walk home."], "Walked tells about an action that already happened.")];
  }
  if (lower.includes("statement") || lower.includes("question") || lower.includes("exclamation")) {
    return [multiSelectQuestion(route, "sentence-kind", "Select the sentences that ask something.", ["Where is the book?", "Can you help?"], ["Where is the book?", "The book is here.", "Can you help?", "What a great book!"], "Questions ask something and usually end with a question mark.")];
  }
  if (lower.includes("one or more than one") || lower.includes("plural")) {
    return [namedChoiceQuestion(route, "singular-plural", "Which word names more than one?", "dogs", ["dogs", "dog", "runs"], "Dogs is plural, so it names more than one dog.")];
  }
  return [namedChoiceQuestion(route, "grammar", "Which word is a noun?", "dog", ["run", "dog", "blue"], "Dog names a thing, so it is a noun.")];
}

function scienceEngineeringQuestions(route: string): ExerciseQuestion[] {
  return [
    orderQuestion(route, "design", "Put the engineering design actions in order.", ["test", "use evidence", "improve"], "Engineering design uses test results to improve solutions."),
    namedChoiceQuestion(route, "constraint", "Which is a design constraint?", "the bridge must hold 10 pounds", ["the bridge must hold 10 pounds", "the sky is blue", "rocks are old"], "A constraint is a requirement or limit for the design.")
  ];
}

function cellsQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "cell-part", "Which cell part controls what enters and leaves the cell?", "cell membrane", ["cell membrane", "cloud", "magnet"], "The cell membrane controls movement into and out of a cell."),
    namedChoiceQuestion(route, "mitosis", "What happens during mitosis?", "one cell divides into two cells", ["one cell divides into two cells", "water freezes", "a magnet repels"], "Mitosis is cell division.")
  ];
}

function chemistryQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "reaction", "Which evidence can show a chemical reaction?", "a new gas forms", ["a new gas forms", "paper is folded", "water is poured"], "Gas formation can be evidence of a chemical reaction."),
    namedChoiceQuestion(route, "moles", "A mole is used to count what?", "particles of a substance", ["particles of a substance", "calendar days", "map directions"], "Chemists use moles to count particles.")
  ];
}

function physicsQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "motion", "If speed increases, what changes?", "motion", ["motion", "spelling", "citizenship"], "Speed describes how motion changes over time."),
    namedChoiceQuestion(route, "magnetism", "Opposite magnetic poles usually do what?", "attract", ["attract", "evaporate", "divide"], "Opposite magnetic poles attract.")
  ];
}

function measurementUnitsQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "unit-distance", "Which unit can measure distance?", "meter", ["meter", "gram", "liter"], "Meters measure length or distance."),
    namedChoiceQuestion(route, "thermometer", "What tool measures temperature?", "thermometer", ["thermometer", "ruler", "balance"], "A thermometer measures temperature.")
  ];
}

function editingQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "revise", "Which sentence is clearer?", "The sign says, \"No parking.\"", ["The sign says, \"No parking.\"", "Sign no parking says.", "Parking no sign."], "The clearest sentence puts the words in a logical order."),
    namedChoiceQuestion(route, "redundant", "Which phrase avoids repetition?", "final result", ["final result", "final end result", "result result"], "Avoiding unnecessary repeated words makes writing clearer.")
  ];
}

function earlyComprehensionQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "real-life", "Which event could happen in real life?", "A child plants a seed.", ["A child plants a seed.", "A pencil talks.", "The moon eats soup."], "Planting a seed is realistic."),
    namedChoiceQuestion(route, "feeling", "A child is smiling and clapping. How does the child probably feel?", "happy", ["happy", "sleepy", "lost"], "Smiling and clapping are clues that the child feels happy.")
  ];
}

function locationWordQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "location", "Which word tells where the cup is?", "beside", ["beside", "green", "run"], "Beside is a location word."),
    namedChoiceQuestion(route, "question-word", "Which word asks about a place?", "where", ["where", "when", "who"], "Where asks about location.")
  ];
}

function romanNumeralQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "roman-v", "What number does V represent?", "5", ["1", "5", "10"], "In Roman numerals, V means 5."),
    namedChoiceQuestion(route, "roman-x", "What number does X represent?", "10", ["5", "9", "10"], "In Roman numerals, X means 10.")
  ];
}

function logicQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "conditional", "Which statement is conditional?", "If it rains, then the ground gets wet.", ["If it rains, then the ground gets wet.", "The ground is wet.", "Rain is water."], "Conditional statements use an if-then structure."),
    namedChoiceQuestion(route, "truth", "If a statement is true, what is its truth value?", "true", ["true", "parallel", "fraction"], "A true statement has a truth value of true.")
  ];
}

function unitConversionQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "customary", "Which is a customary length unit?", "inch", ["inch", "liter", "gram"], "Inches are customary units of length."),
    namedChoiceQuestion(route, "metric", "Which is a metric length unit?", "centimeter", ["centimeter", "pound", "cup"], "Centimeters are metric units of length.")
  ];
}

function ecologyQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "ecosystem", "Which interaction is part of an ecosystem?", "organisms using resources", ["organisms using resources", "numbers in order", "commas in a sentence"], "Ecosystems include organisms interacting with resources."),
    namedChoiceQuestion(route, "succession", "What can happen after a disturbance in an ecosystem?", "new organisms gradually move in", ["new organisms gradually move in", "all matter disappears", "magnets stop working"], "Succession describes ecological change over time.")
  ];
}

function holidayCultureQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "holiday", "What can a holiday help people remember or celebrate?", "an important person, event, or tradition", ["an important person, event, or tradition", "only a map key", "only a math fact"], "Holidays often connect to history, culture, or traditions."),
    namedChoiceQuestion(route, "culture", "Which is an example of culture?", "a community tradition", ["a community tradition", "a subtraction sign", "a thermometer"], "Traditions are part of culture.")
  ];
}

function spanishListeningQuestions(route: string): ExerciseQuestion[] {
  return [
    namedChoiceQuestion(route, "listen", "A speaker says me gusta leer. What activity is mentioned?", "reading", ["reading", "running", "cooking"], "Leer means to read."),
    namedChoiceQuestion(route, "match", "Which image would match la familia?", "a family", ["a family", "a clock", "a school subject"], "La familia means the family.")
  ];
}

function spanishWritingQuestions(route: string): ExerciseQuestion[] {
  return [
    inputQuestion(route, "letter", "Type a phrase that could begin a friendly letter to a friend.", "Querido amigo:", "Querido amigo is a common friendly-letter opening.", undefined, "Greeting"),
    orderQuestion(route, "sentence", "Build the sentence that means I like soccer.", ["Me", "gusta", "el", "futbol."], "Me gusta can express likes.")
  ];
}

function languageArtsQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("syllable")) {
    return [
      namedChoiceQuestion(route, "syllables", "How many syllables are in basket?", "2", ["1", "2", "3"], "Basket has two beats: bas-ket."),
      namedChoiceQuestion(route, "combine-syllables", "Put the syllables sun and set together.", "sunset", ["sunset", "setsun", "sun"], "The syllables make the word sunset.")
    ];
  }
  if (includesAny(lower, ["blend", "digraph", "consonant"])) {
    return [namedChoiceQuestion(route, "blend", "Which word begins with the blend bl?", "blue", ["blue", "cat", "run"], "Blue begins with the consonant blend bl.")];
  }
  if (lower.includes("homophone")) {
    return [namedChoiceQuestion(route, "homophone", "Which word sounds like sea?", "see", ["see", "say", "sit"], "Sea and see sound alike but have different meanings.")];
  }
  if (includesAny(lower, ["simile", "metaphor", "figurative", "idiom", "personification"])) {
    return [namedChoiceQuestion(route, "figurative", "Which sentence uses a simile?", "The snow was like a blanket.", ["The snow was like a blanket.", "The snow fell.", "The snow is cold."], "A simile compares using like or as.")];
  }
  if (includesAny(lower, ["comma", "capital", "punctuation", "apostrophe", "quotation", "semicolon", "colon"])) {
    return [namedChoiceQuestion(route, "mechanics", "Which sentence uses a comma correctly?", "Yes, I can help.", ["Yes, I can help.", "Yes I, can help.", "Yes I can, help."], "The comma separates the introductory yes from the rest of the sentence.")];
  }
  if (includesAny(lower, ["dictionary", "reference", "thesaurus", "entry", "guide word"])) {
    return [namedChoiceQuestion(route, "reference", "Which reference source helps you find word meanings?", "dictionary", ["dictionary", "calendar", "map"], "A dictionary gives meanings, pronunciations, and word forms.")];
  }
  if (includesAny(lower, ["transition", "organize", "topic", "paragraph", "essay", "revise", "editing"])) {
    return [namedChoiceQuestion(route, "writing", "Which transition shows contrast?", "however", ["however", "also", "first"], "However signals a contrast between ideas.")];
  }
  if (includesAny(lower, ["correct errors", "suggest appropriate revisions", "remove redundant", "comparisons", "signs"])) {
    return editingQuestions(route);
  }
  if (includesAny(lower, ["character", "dialogue", "point of view", "narrative", "narrator", "myths", "legends", "fables", "historical fiction", "short stories", "passage", "passages", "theme", "tone"])) {
    return literaryAnalysisQuestions(route);
  }
  if (includesAny(lower, ["claim", "evidence", "argument", "thesis", "counterclaim", "fact", "opinion", "audience", "purpose"])) {
    return argumentQuestions(route);
  }
  if (includesAny(lower, ["prefix", "suffix", "root", "roots", "base word", "words with", "pre-", "re-", "mis-", "sub-", "un-", "dis-", "in-", "im-", "non", "analogies", "connotation", "precisely", "multiple-meaning", "figures of speech"])) {
    return wordStudyQuestions(route);
  }
  if (lower.includes("sight words") || lower.includes("sight word")) {
    return [
      namedChoiceQuestion(route, "sight-word-read", "Which word is the sight word after?", "after", ["after", "again", "around"], "The word after is spelled a-f-t-e-r."),
      namedChoiceQuestion(route, "sight-word-sentence", "Choose the word that completes the sentence: We went home __ school.", "after", ["after", "blue", "jump"], "After tells when we went home.")
    ];
  }
  if (lower.includes("lowercase")) {
    return [
      namedChoiceQuestion(route, "lowercase-match", "Which lowercase letter matches A?", "a", ["a", "b", "d"], "The lowercase form of A is a."),
      namedChoiceQuestion(route, "lowercase-shape", "Which letter is lowercase b?", "b", ["b", "d", "p"], "Lowercase b has a tall line and a bump on the right.")
    ];
  }
  if (lower.includes("uppercase")) {
    return [
      namedChoiceQuestion(route, "uppercase-match", "Which uppercase letter matches m?", "M", ["M", "N", "W"], "The uppercase form of m is M."),
      namedChoiceQuestion(route, "uppercase-shape", "Which letter is uppercase T?", "T", ["T", "F", "L"], "Uppercase T has a top line and a middle stem.")
    ];
  }
  if (lower.includes("letter") || lower.includes("alphabet")) {
    return [
      namedChoiceQuestion(route, "letter-a", "Which choice is the letter A?", "A", ["A", "B", "C"], "The uppercase letter A is A."),
      namedChoiceQuestion(route, "letter-b", "Which choice is the letter b?", "b", ["d", "b", "p"], "The lowercase letter b has a tall line and a bump on the right.")
    ];
  }
  if (lower.includes("short vowel") || lower.includes("short a") || lower.includes("short e") || lower.includes("short i") || lower.includes("short o") || lower.includes("short u") || lower.includes("short-a") || lower.includes("short-e") || lower.includes("short-i") || lower.includes("short-o") || lower.includes("short-u")) {
    return [
      namedChoiceQuestion(route, "short-vowel", "Which word has the short a sound?", "cat", ["cat", "cake", "cube"], "Cat has the short a sound."),
      namedChoiceQuestion(route, "complete-short-vowel", "Complete the word: c_t", "a", ["a", "e", "o"], "The word cat uses short a.")
    ];
  }
  if (lower.includes("long vowel") || lower.includes("long a") || lower.includes("long e") || lower.includes("long i") || lower.includes("long o") || lower.includes("long u") || lower.includes("silent e") || lower.includes("vowel team")) {
    return [
      namedChoiceQuestion(route, "long-vowel", "Which word has a long a sound?", "cake", ["cake", "cat", "cup"], "Cake has a long a sound."),
      namedChoiceQuestion(route, "vowel-team", "Which word has the vowel team ea?", "team", ["team", "top", "tap"], "Team uses the vowel team ea.")
    ];
  }
  if (lower.includes("rhyme")) {
    return [namedChoiceQuestion(route, "rhyme", "Which word rhymes with cat?", "hat", ["hat", "dog", "sun"], "Cat and hat rhyme because they end with the same sound.")];
  }
  if (includesAny(lower, ["complete the word", "matches the picture", "same ending", "read words", "-ss", "-ll", "-ff", "-zz", "-ck", "word: ng", "word-ng", "ng, nk", "ng and nk", "am and an"])) {
    return [namedChoiceQuestion(route, "phonics-pattern", "Which word ends with the same sound as bell?", "shell", ["shell", "bike", "moon"], "Bell and shell share the ending sound /el/.")];
  }
  if (lower.includes("sound") || lower.includes("begins") || lower.includes("starts")) {
    return [namedChoiceQuestion(route, "sound", "Which word starts with /m/?", "moon", ["sun", "moon", "fish"], "Moon starts with the /m/ sound.")];
  }
  if (lower.includes("synonym")) {
    return [namedChoiceQuestion(route, "synonym", "Which word means the same as big?", "large", ["large", "tiny", "late"], "Large and big have similar meanings.")];
  }
  if (lower.includes("antonym")) {
    return [namedChoiceQuestion(route, "antonym", "Which word means the opposite of hot?", "cold", ["cold", "warm", "heat"], "Cold is the opposite of hot.")];
  }
  if (lower.includes("context") || lower.includes("meaning") || lower.includes("domain-specific")) {
    return [namedChoiceQuestion(route, "context", "Use context: The desert was arid, with almost no rain. What does arid mean?", "dry", ["dry", "crowded", "loud"], "Almost no rain is a clue that arid means dry.")];
  }
  if (lower.includes("sentence") || lower.includes("grammar") || lower.includes("noun") || lower.includes("verb") || lower.includes("pronoun") || lower.includes("adjective") || lower.includes("punctuation") || lower.includes("plural") || lower.includes("possessive") || lower.includes("clause") || lower.includes("modifier") || lower.includes("prepositional phrase") || lower.includes("conjunction") || lower.includes("antecedent") || lower.includes("tense") || lower.includes("to be") || lower.includes("to have") || lower.includes("statement") || lower.includes("question") || lower.includes("exclamation") || lower.includes("one or more than one")) {
    return grammarQuestions(route, title);
  }
  if (lower.includes("book") || lower.includes("story") || lower.includes("text") || lower.includes("plot") || lower.includes("main idea") || lower.includes("inference") || lower.includes("read about") || lower.includes("read realistic") || lower.includes("read animal") || lower.includes("read along") || lower.includes("fantasy")) {
    return [namedChoiceQuestion(route, "reading", "Which part of a book tells the name of the book?", "title", ["title", "page number", "period"], "The title tells the name of the book.")];
  }
  if (includesAny(lower, ["what am i", "could happen in real life", "feeling matches", "which book title", "not like the others"])) {
    return earlyComprehensionQuestions(route);
  }
  if (includesAny(lower, ["use number words", "use color words", "same words", "words that are the same"])) {
    return [namedChoiceQuestion(route, "basic-vocabulary", "Which word names a color?", "blue", ["blue", "run", "two"], "Blue is a color word.")];
  }
  if (includesAny(lower, ["inside and outside", "above and below", "location word", "who what when where or why", "who, what, when, where, or why", "abc order"])) {
    return locationWordQuestions(route);
  }
  return [
    namedChoiceQuestion(route, "vocabulary", "Which answer best matches this language arts skill?", cleanTitle(title), [cleanTitle(title), "math facts", "coin names"], `This skill practices ${cleanTitle(title).toLowerCase()}.`)
  ];
}

function scienceQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("weather") || lower.includes("hot") || lower.includes("cold")) {
    return [namedChoiceQuestion(route, "weather", "Which word describes ice?", "cold", ["hot", "cold", "bright"], "Ice is cold.")];
  }
  if (lower.includes("animal") || lower.includes("animals") || lower.includes("survive") || lower.includes("habitat") || lower.includes("pollinator") || lower.includes("symbiotic")) {
    return [namedChoiceQuestion(route, "animals", "What do animals need to survive?", "food and water", ["food and water", "only toys", "only rocks"], "Animals need food and water to survive.")];
  }
  if (lower.includes("push") || lower.includes("pushes") || lower.includes("pull") || lower.includes("pulls") || lower.includes("force") || lower.includes("forces")) {
    return [namedChoiceQuestion(route, "force", "Which action is a push?", "moving a box away", ["moving a box away", "bringing a wagon closer", "sleeping"], "A push moves something away.")];
  }
  if (lower.includes("plant") || lower.includes("moss") || lower.includes("fern")) {
    return [namedChoiceQuestion(route, "plants", "What does a plant need?", "light", ["light", "shoes", "paper"], "Plants need light to grow.")];
  }
  if (includesAny(lower, ["design", "engineering", "solution", "solutions", "prevent", "hazard"])) {
    return scienceEngineeringQuestions(route);
  }
  if (includesAny(lower, ["cell", "cells", "mitosis", "codon", "dna", "membrane", "respiration", "carbohydrate"])) {
    return cellsQuestions(route);
  }
  if (includesAny(lower, ["chemical", "chemistry", "reaction", "reactants", "products", "moles", "solubility", "equilibrium"])) {
    return chemistryQuestions(route);
  }
  if (includesAny(lower, ["kinematic", "coulomb", "magnet", "magnetism", "electricity", "charged", "thermal", "heat", "energy", "waves"])) {
    return physicsQuestions(route);
  }
  if (includesAny(lower, ["unit", "units", "thermometer", "temperature", "distance", "mass", "volume", "speed"])) {
    return measurementUnitsQuestions(route);
  }
  if (includesAny(lower, ["succession", "ecosystem", "biodiversity", "group behavior", "caribou", "coral reef", "gene mutations", "organisms"])) {
    return ecologyQuestions(route);
  }
  return [namedChoiceQuestion(route, "science", "Which answer is evidence?", "an observation", ["an observation", "a guess with no support", "a random choice"], "Science uses observations as evidence.")];
}

function socialStudiesQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("map") || lower.includes("direction") || lower.includes("feature")) {
    return [namedChoiceQuestion(route, "map", "Which is a cardinal direction?", "north", ["north", "near", "round"], "North is a cardinal direction.")];
  }
  if (lower.includes("citizen") || lower.includes("community")) {
    return [namedChoiceQuestion(route, "citizen", "Which action shows good citizenship?", "helping a neighbor", ["helping a neighbor", "breaking a rule", "littering"], "Helping a neighbor supports the community.")];
  }
  if (lower.includes("history") || lower.includes("symbol") || lower.includes("american")) {
    return [namedChoiceQuestion(route, "symbol", "Which is an American symbol?", "flag", ["flag", "pencil", "chair"], "A flag can be an American symbol.")];
  }
  if (lower.includes("job") || lower.includes("worker")) {
    return [namedChoiceQuestion(route, "job", "Who helps keep people safe?", "firefighter", ["firefighter", "pillow", "map"], "A firefighter is a community helper.")];
  }
  if (includesAny(lower, ["economics", "scarcity", "shortage", "surplus", "supply", "demand", "producer", "consumer", "resources", "needs", "wants"])) {
    return [namedChoiceQuestion(route, "economics", "What does scarcity mean?", "not enough resources for every want", ["not enough resources for every want", "a map symbol", "a national holiday"], "Scarcity means resources are limited.")];
  }
  if (includesAny(lower, ["city", "rural", "urban", "suburban", "latitude", "longitude", "states", "capitals", "grid", "land features"])) {
    return [namedChoiceQuestion(route, "geography", "Which tool helps locate places?", "map", ["map", "coin", "sentence"], "Maps and grids help locate places.")];
  }
  if (includesAny(lower, ["law", "court", "constitution", "citizenship", "government", "election", "presidential"])) {
    return [namedChoiceQuestion(route, "civics", "What is a law?", "a rule a community or government makes", ["a rule a community or government makes", "a type of landform", "a synonym"], "Laws are rules made by governments or communities.")];
  }
  if (includesAny(lower, ["then and now", "war", "revolution", "colony", "colonist", "ancient", "empire", "renaissance", "industrial", "expedition", "purchase", "new deal"])) {
    return [namedChoiceQuestion(route, "history", "What does a timeline show?", "events in order", ["events in order", "coin values", "sentence parts"], "A timeline organizes events by time.")];
  }
  if (includesAny(lower, ["martin luther king", "thanksgiving", "kwanzaa", "ramadan", "hinduism"])) {
    return holidayCultureQuestions(route);
  }
  if (includesAny(lower, ["facts and opinions", "facts", "opinions"])) {
    return argumentQuestions(route);
  }
  return [namedChoiceQuestion(route, "social-studies", "What does social studies help us learn about?", "people and places", ["people and places", "only numbers", "only spelling"], "Social studies includes people, places, communities, and history.")];
}

function spanishQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("number") || /\b0-10\b|\b11-20\b|\b21-31\b/.test(lower)) {
    return [
      namedChoiceQuestion(route, "uno", "What does uno mean?", "one", ["one", "two", "three"], "Uno means one."),
      namedChoiceQuestion(route, "dos", "What does dos mean?", "two", ["one", "two", "ten"], "Dos means two."),
      namedChoiceQuestion(route, "diez", "What does diez mean?", "ten", ["six", "ten", "twenty"], "Diez means ten.")
    ];
  }
  if (lower.includes("noun") || lower.includes("gender") || lower.includes("plural")) {
    return [namedChoiceQuestion(route, "noun-gender", "Which article usually goes with libro?", "el", ["el", "la", "las"], "Libro is usually masculine, so it uses el.")];
  }
  if (lower.includes("verb") || lower.includes("ser") || lower.includes("estar") || lower.includes("tener") || includesWordAny(lower, ["ir", "ver"]) || lower.includes("gustar") || lower.includes("infinitive") || lower.includes("acabar")) {
    return [namedChoiceQuestion(route, "verb", "Complete the sentence: Yo __ estudiante.", "soy", ["soy", "eres", "son"], "Yo uses soy with ser.")];
  }
  if (lower.includes("alphabet")) {
    return [namedChoiceQuestion(route, "alphabet", "Which letter name is Spanish?", "a", ["a", "apple", "after"], "The Spanish alphabet includes the letter a.")];
  }
  if (includesAny(lower, ["listen", "match the statement", "identify the person", "describe an image"])) {
    return spanishListeningQuestions(route);
  }
  if (includesAny(lower, ["greeting", "goodbye", "introductions", "conversation", "response", "question", "personal information", "how are you", "tu and usted", "tú and usted", "formal language"])) {
    return [namedChoiceQuestion(route, "conversation", "Which phrase is a Spanish greeting?", "hola", ["hola", "adios", "gracias"], "Hola is a common greeting.")];
  }
  if (includesAny(lower, ["country", "countries", "spanish-speaking"])) {
    return [namedChoiceQuestion(route, "countries", "Which country is Spanish-speaking?", "Mexico", ["Mexico", "Japan", "Germany"], "Spanish is widely spoken in Mexico.")];
  }
  if (includesAny(lower, ["adjective", "appearance", "personalities", "agreement"])) {
    return [namedChoiceQuestion(route, "adjective", "Which Spanish adjective can mean tall?", "alto", ["alto", "rojo", "lunes"], "Alto can describe someone as tall.")];
  }
  if (includesAny(lower, ["school", "class", "classes", "classroom", "supplies", "student"])) {
    return [namedChoiceQuestion(route, "school", "Which Spanish word can mean school?", "escuela", ["escuela", "manzana", "perro"], "Escuela means school.")];
  }
  if (includesAny(lower, ["family", "families", "pets", "people"])) {
    return [namedChoiceQuestion(route, "family", "Which Spanish word means mother?", "madre", ["madre", "lunes", "azul"], "Madre means mother.")];
  }
  if (includesAny(lower, ["food", "meals", "drinks", "fruits", "vegetables"])) {
    return [namedChoiceQuestion(route, "food", "Which Spanish word can mean water?", "agua", ["agua", "escuela", "lunes"], "Agua means water.")];
  }
  if (includesAny(lower, ["sports", "hobbies", "pastimes", "free time"])) {
    return [namedChoiceQuestion(route, "pastimes", "Which Spanish word can mean soccer?", "futbol", ["futbol", "madre", "rojo"], "Futbol means soccer.")];
  }
  if (includesAny(lower, ["preposition", "prepositions", "prepositions of place", "a and de"]) || includesWordAny(lower, ["al", "del"])) {
    return [namedChoiceQuestion(route, "preposition", "Which Spanish preposition can mean in or on?", "en", ["en", "dos", "alto"], "En can mean in or on.")];
  }
  if (includesAny(lower, ["article", "articles", "definite", "indefinite"])) {
    return [namedChoiceQuestion(route, "article", "Which article can mean the before a masculine noun?", "el", ["el", "una", "las"], "El is a masculine singular definite article.")];
  }
  if (includesAny(lower, ["telling time", "time expressions", "hours", "minutes", "frequency"])) {
    return [namedChoiceQuestion(route, "time", "Which phrase can mean at three o'clock?", "a las tres", ["a las tres", "la familia", "el agua"], "A las tres means at three o'clock.")];
  }
  if (includesAny(lower, ["complete a letter", "write sentences", "respond to plans", "sentence structure"])) {
    return spanishWritingQuestions(route);
  }
  if (lower.includes("day") || lower.includes("week")) {
    return [namedChoiceQuestion(route, "days", "Which word is a day of the week in Spanish?", "lunes", ["lunes", "rojo", "uno"], "Lunes means Monday.")];
  }
  if (lower.includes("color")) {
    return [namedChoiceQuestion(route, "colors", "What does rojo mean?", "red", ["red", "blue", "green"], "Rojo means red.")];
  }
  return [namedChoiceQuestion(route, "spanish", "Choose the Spanish word.", "hola", ["hola", "hello", "chair"], "Hola is a Spanish greeting.")];
}

function languageArtsMode(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("syllable")) return "Syllables";
  if (includesAny(lower, ["blend", "digraph", "consonant"])) return "Consonant patterns";
  if (lower.includes("homophone")) return "Homophones";
  if (includesAny(lower, ["simile", "metaphor", "figurative", "idiom", "personification"])) return "Figurative language";
  if (includesAny(lower, ["comma", "capital", "punctuation", "apostrophe", "quotation", "semicolon", "colon"])) return "Mechanics";
  if (includesAny(lower, ["dictionary", "reference", "thesaurus", "entry", "guide word"])) return "Reference skills";
  if (includesAny(lower, ["transition", "organize", "topic", "paragraph", "essay", "revise", "editing"])) return "Writing organization";
  if (includesAny(lower, ["correct errors", "suggest appropriate revisions", "remove redundant", "comparisons", "signs"])) return "Editing and revision";
  if (includesAny(lower, ["book part", "book parts", "feature"])) return "Text features";
  if (includesAny(lower, ["categor", "sort objects", "shades of meaning", "related words", "multiple meaning", "words that are the same", "same words"])) return "Word relationships";
  if (includesAny(lower, ["character", "dialogue", "point of view", "narrative", "narrator", "myths", "legends", "fables", "historical fiction", "short stories", "passage", "passages", "theme", "tone"])) return "Literary analysis";
  if (includesAny(lower, ["claim", "evidence", "argument", "thesis", "counterclaim", "fact", "opinion", "audience", "purpose"])) return "Argument and evidence";
  if (includesAny(lower, ["prefix", "suffix", "root", "roots", "base word", "words with", "pre-", "re-", "mis-", "sub-", "un-", "dis-", "in-", "im-", "non", "analogies", "connotation", "precisely", "multiple-meaning", "figures of speech"])) return "Word study";
  if (lower.includes("sight word")) return "Sight words";
  if (lower.includes("lowercase") || lower.includes("uppercase") || lower.includes("letter") || lower.includes("alphabet")) return "Letter recognition";
  if (lower.includes("short vowel") || lower.includes("short a") || lower.includes("short e") || lower.includes("short i") || lower.includes("short o") || lower.includes("short u") || lower.includes("long vowel") || lower.includes("long a") || lower.includes("long e") || lower.includes("long i") || lower.includes("long o") || lower.includes("long u") || lower.includes("silent e") || lower.includes("vowel team") || lower.includes("vowel") || lower.includes("diphthong") || lower.includes("r-control") || lower.includes("r-controlled") || lower.includes("ending that you hear") || lower.includes("complete the word") || lower.includes("matches the picture") || lower.includes("same ending") || lower.includes("read words") || lower.includes("-ss") || lower.includes("-ll") || lower.includes("-ff") || lower.includes("-zz") || lower.includes("-ck") || lower.includes("word: ng") || lower.includes("word-ng") || lower.includes("ng, nk") || lower.includes("ng and nk") || lower.includes("am and an") || lower.includes("compound word")) return "Phonics";
  if (lower.includes("rhyme") || lower.includes("sound") || lower.includes("begins") || lower.includes("starts")) return "Phonological awareness";
  if (lower.includes("synonym") || lower.includes("antonym") || lower.includes("context") || lower.includes("meaning") || lower.includes("domain-specific") || lower.includes("use number words") || lower.includes("use color words")) return "Vocabulary";
  if (lower.includes("sentence") || lower.includes("noun") || lower.includes("verb") || lower.includes("pronoun") || lower.includes("adjective") || lower.includes("plural") || lower.includes("possessive") || lower.includes("clause") || lower.includes("modifier") || lower.includes("prepositional phrase") || lower.includes("end mark") || lower.includes("conjunction") || lower.includes("antecedent") || lower.includes("tense") || lower.includes("to be") || lower.includes("to have") || lower.includes("statement") || lower.includes("question") || lower.includes("exclamation") || lower.includes("one or more than one")) return "Grammar";
  if (lower.includes("story") || lower.includes("text") || lower.includes("plot") || lower.includes("main idea") || lower.includes("inference") || lower.includes("read about") || lower.includes("read realistic") || lower.includes("read animal") || lower.includes("read along") || lower.includes("fantasy") || lower.includes("what will happen next") || lower.includes("what is the picture about")) return "Reading comprehension";
  if (includesAny(lower, ["what am i", "could happen in real life", "feeling matches", "which book title", "not like the others"])) return "Early comprehension";
  if (includesAny(lower, ["inside and outside", "above and below", "location word", "who what when where or why", "who, what, when, where, or why", "abc order"])) return "Language concepts";
  return "Language skill review";
}

function spanishMode(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("number") || /\b0-10\b|\b11-20\b|\b21-31\b/.test(lower)) return "Spanish numbers";
  if (lower.includes("noun") || lower.includes("gender") || lower.includes("plural")) return "Spanish nouns";
  if (lower.includes("verb") || lower.includes("ser") || lower.includes("estar") || lower.includes("tener") || includesWordAny(lower, ["ir", "ver"]) || lower.includes("gustar") || lower.includes("infinitive") || lower.includes("acabar")) return "Spanish verbs";
  if (lower.includes("alphabet")) return "Spanish alphabet";
  if (includesAny(lower, ["listen", "match the statement", "identify the person", "describe an image"])) return "Spanish listening";
  if (includesAny(lower, ["complete a letter", "write sentences", "respond to plans", "sentence structure"])) return "Spanish writing";
  if (includesAny(lower, ["cognates", "parts of speech"])) return "Spanish word study";
  if (includesAny(lower, ["greeting", "goodbye", "introductions", "conversation", "response", "question", "personal information", "how are you", "tu and usted", "tú and usted", "formal language"])) return "Spanish conversation";
  if (includesAny(lower, ["country", "countries", "spanish-speaking"])) return "Spanish-speaking countries";
  if (includesAny(lower, ["adjective", "appearance", "personalities", "agreement"])) return "Spanish adjectives";
  if (includesAny(lower, ["school", "class", "classes", "classroom", "supplies", "student"])) return "Spanish school vocabulary";
  if (includesAny(lower, ["family", "families", "pets", "people"])) return "Spanish family vocabulary";
  if (includesAny(lower, ["food", "meals", "drinks", "fruits", "vegetables"])) return "Spanish food vocabulary";
  if (includesAny(lower, ["sports", "hobbies", "pastimes", "free time"])) return "Spanish pastimes";
  if (includesAny(lower, ["preposition", "prepositions", "prepositions of place", "a and de"]) || includesWordAny(lower, ["al", "del"])) return "Spanish prepositions";
  if (includesAny(lower, ["article", "articles", "definite", "indefinite"])) return "Spanish articles";
  if (includesAny(lower, ["telling time", "time expressions", "hours", "minutes", "frequency"])) return "Spanish time expressions";
  if (lower.includes("color")) return "Spanish colors";
  if (lower.includes("day") || lower.includes("week") || lower.includes("month") || lower.includes("date")) return "Spanish calendar";
  if (lower.includes("weather") || lower.includes("season")) return "Spanish weather";
  return "Spanish communication";
}

function scienceMode(title: string) {
  const lower = title.toLowerCase();
  if (includesWordAny(lower, ["weather", "climate", "season", "hot", "cold", "temperature"])) return "Weather and climate";
  if (includesWordAny(lower, ["push", "pushes", "pull", "pulls", "force", "forces", "motion", "magnet", "electric", "sound", "light"])) return "Physical science";
  if (includesWordAny(lower, ["plant", "plants", "seed", "seeds", "root", "roots", "flower", "flowers", "moss", "fern"]) || lower.includes("photosynthesis")) return "Plants";
  if (includesWordAny(lower, ["animal", "animals", "habitat", "habitats", "survive", "life cycle", "body", "trait", "pollinator", "symbiotic"])) return "Animals and habitats";
  if (includesWordAny(lower, ["rock", "rocks", "mineral", "minerals", "fossil", "fossils", "soil", "water", "earth", "landform", "moon", "sun", "space", "topographic"])) return "Earth and space science";
  if (includesWordAny(lower, ["matter", "solid", "solids", "liquid", "liquids", "gas", "gases", "material", "materials", "property", "properties"])) return "Matter and materials";
  if (includesWordAny(lower, ["experiment", "evidence", "observe", "data", "model", "investigation", "formula", "formulas"])) return "Science practices";
  if (includesAny(lower, ["design", "engineering", "solution", "solutions", "prevent", "hazard"])) return "Engineering design";
  if (includesAny(lower, ["cell", "cells", "mitosis", "codon", "dna", "membrane", "respiration", "carbohydrate"])) return "Cells and genetics";
  if (includesAny(lower, ["chemical", "chemistry", "reaction", "reactants", "products", "moles", "solubility", "equilibrium"])) return "Chemistry";
  if (includesAny(lower, ["kinematic", "coulomb", "magnet", "magnetism", "electricity", "charged", "thermal", "heat", "energy", "waves"])) return "Physics";
  if (includesAny(lower, ["unit", "units", "thermometer", "distance", "mass", "volume", "speed"])) return "Measurement units";
  if (includesAny(lower, ["succession", "ecosystem", "biodiversity", "group behavior", "caribou", "coral reef", "gene mutations", "organisms"])) return "Ecology and organisms";
  return "Science concepts";
}

function socialStudiesMode(title: string) {
  const lower = title.toLowerCase();
  if (includesAny(lower, ["economics", "scarcity", "shortage", "surplus", "supply", "demand", "producer", "consumer", "resources", "needs", "wants"])) return "Economics and resources";
  if (includesAny(lower, ["city", "cities", "rural", "urban", "suburban", "latitude", "longitude", "states", "capitals", "grid", "land features", "cardinal direction", "cardinal directions", "left and right"])) return "Geography and maps";
  if (includesAny(lower, ["law", "court", "constitution", "citizenship", "government", "election", "presidential"])) return "Civics and citizenship";
  if (includesAny(lower, ["then and now", "war", "revolution", "colony", "colonist", "colonies", "ancient", "mesopotamia", "rome", "middle ages", "antebellum", "empire", "renaissance", "industrial", "expedition", "purchase", "new deal", "timeline", "bce", "ce", "washington", "statue of liberty", "white house", "independence day"])) return "History and chronology";
  if (includesWordAny(lower, ["map", "maps", "direction", "directions", "feature", "features", "location", "state", "states", "country", "continent", "region", "geography"])) return "Geography and maps";
  if (includesWordAny(lower, ["citizen", "community", "rule", "law", "government", "civic", "rights", "responsibilities"])) return "Civics and citizenship";
  if (includesWordAny(lower, ["history", "historical", "timeline", "past", "american", "symbol", "president", "colony", "revolution"])) return "History and symbols";
  if (includesWordAny(lower, ["job", "worker", "goods", "services", "money", "market", "economic", "business"])) return "Economics and community roles";
  if (includesAny(lower, ["martin luther king", "thanksgiving", "kwanzaa", "ramadan", "hinduism"])) return "Culture and society";
  if (includesAny(lower, ["facts and opinions", "facts", "opinions"])) return "Source analysis";
  if (includesWordAny(lower, ["culture", "holiday", "tradition", "religion", "civilization"])) return "Culture and society";
  if (includesWordAny(lower, ["source", "primary", "secondary", "artifact", "document"])) return "Source analysis";
  return "Social studies concepts";
}

function nonMathExerciseSet(route: string, title: string): ExerciseSet {
  if (route.startsWith("/ela/")) {
    return { route, title, mode: languageArtsMode(title), summary: "Practice reading, writing, vocabulary, grammar, or comprehension with short questions.", questions: languageArtsQuestions(route, title) };
  }
  if (route.startsWith("/science/")) {
    return { route, title, mode: scienceMode(title), summary: "Practice science ideas with evidence-based questions.", questions: scienceQuestions(route, title) };
  }
  if (route.startsWith("/social-studies/")) {
    return { route, title, mode: socialStudiesMode(title), summary: "Practice civics, geography, history, economics, and culture concepts.", questions: socialStudiesQuestions(route, title) };
  }
  if (route.startsWith("/spanish/")) {
    return { route, title, mode: spanishMode(title), summary: "Practice Spanish vocabulary, grammar, and context skills.", questions: spanishQuestions(route, title) };
  }
  return { route, title, mode: "Skill practice", summary: "Practice this skill with short, checkable questions.", questions: genericChoiceQuestions(route, title) };
}

function maxFromRoute(route: string, title: string) {
  const match = `${route} ${title}`.match(/up-to-(\d+)|up to (\d+)/i);
  return Math.min(Number(match?.[1] ?? match?.[2] ?? 20), 1000);
}

function reviewedMathMode(title: string) {
  const lower = title.toLowerCase();
  if (includesAny(lower, ["word problem", "multi-step", "real-world"])) return "Math word problems";
  if (includesAny(lower, ["expression", "evaluate", "equivalent expression", "numerical expression"])) return "Expressions";
  if (includesWordAny(lower, ["probability", "probabilities", "odds"]) || lower.includes("compound event")) return "Probability";
  if (includesWordAny(lower, ["integer", "integers"]) || includesAny(lower, ["absolute value", "opposite number"])) return "Integers and rational numbers";
  if (includesAny(lower, ["equal parts", "half", "halves", "third", "thirds", "fourth", "fourths", "eighth", "eighths"])) return "Fractions";
  if (includesAny(lower, ["before, after", "sequence", "order", "greatest", "least", "compare numbers", "comparing numbers", "compare three numbers", "put decimal numbers"])) return "Number order and comparison";
  if (includesWordAny(lower, ["even", "odd"])) return "Even and odd numbers";
  if (includesAny(lower, ["fact families", "related facts"])) return "Fact families";
  if (includesAny(lower, ["number sentences", "which sign makes", "properties of equality"])) return "Equations";
  if (includesAny(lower, ["number names", "names of numbers", "spell word names", "write the number you hear"])) return "Number recognition";
  if (includesAny(lower, ["decompose", "break apart", "tens and ones", "hundreds", "thousands", "regroup", "convert to/from", "make teen numbers", "take apart teen numbers", "ways to make a number"])) return "Place value";
  if (includesAny(lower, ["histogram", "quartiles", "interquartile", "standard deviation", "scatter plot", "trends"])) return "Data and graphs";
  if (includesAny(lower, ["factors", "divisibility"])) return "Factors and divisibility";
  if (includesAny(lower, ["fluency zone"])) return "Math fluency";
  if (includesAny(lower, ["roman numerals"])) return "Roman numerals";
  if (includesAny(lower, ["location in a grid", "coordinate planes as maps"])) return "Coordinate grids";
  if (includesAny(lower, ["conditionals", "truth tables", "truth values"])) return "Logic and truth values";
  if (includesAny(lower, ["customary units", "metric systems", "mixed customary units"])) return "Unit conversion";
  if (includesAny(lower, ["logarithms"])) return "Logarithm properties";
  if (includesAny(lower, ["law of cosines"])) return "Trigonometry";
  if (includesAny(lower, ["calendar", "days of the week", "months of the year", "seasons of the year", "a.m.", "p.m.", "everyday events"])) return "Calendar and time contexts";
  if (includesAny(lower, ["income", "spending", "saving", "charity", "wants", "needs", "earn", "job", "least number of coins", "making change", "coin values", "coin names", "deposit", "withdrawal", "producer", "consumer", "cost to produce"])) return "Financial literacy";
  if (includesWordAny(lower, ["ratio", "ratios", "rate", "rates", "proportion", "proportions", "scale"])) return "Ratios and rates";
  if (includesWordAny(lower, ["percent", "discount", "tax", "interest", "markup"])) return "Percents";
  if (includesAny(lower, ["pythagorean", "triangle", "angle", "line", "ray", "segment", "circle", "polygon", "similarity", "congruence", "theorem", "proof", "construct", "perpendicular", "parallel", "trigonometric"])) return "Geometry reasoning";
  if (includesAny(lower, ["function", "transform", "slope", "linear", "quadratic", "parabola", "ellipse", "hyperbola", "conic", "foci"])) return "Functions and graphs";
  if (includesAny(lower, ["limit", "continuous", "continuity", "derivative", "velocity", "rate of change", "intermediate-value"])) return "Calculus concepts";
  if (includesAny(lower, ["matrix", "matrices", "vector", "complex"])) return "Advanced algebra";
  if (includesAny(lower, ["decimal", "round", "estimate"])) return "Decimals and rounding";
  if (includesAny(lower, ["indirect comparison"])) return "Measurement words";
  return "Math concept review";
}

function reviewedMathQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (includesAny(lower, ["word problem", "multi-step", "real-world"])) return wordProblemQuestions(route);
  if (includesAny(lower, ["expression", "evaluate", "equivalent expression", "numerical expression"])) return expressionQuestions(route);
  if (includesWordAny(lower, ["probability", "probabilities", "odds"]) || lower.includes("compound event")) return probabilityQuestions(route);
  if (includesWordAny(lower, ["integer", "integers"]) || includesAny(lower, ["absolute value", "opposite number"])) return integerQuestions(route);
  if (includesAny(lower, ["equal parts", "half", "halves", "third", "thirds", "fourth", "fourths", "eighth", "eighths"])) return fractionQuestions(route, title);
  if (includesAny(lower, ["before, after", "sequence", "order", "greatest", "least", "compare numbers", "comparing numbers", "compare three numbers", "put decimal numbers"])) return numberOrderQuestions(route);
  if (includesWordAny(lower, ["even", "odd"])) return evenOddQuestions(route);
  if (includesAny(lower, ["fact families", "related facts"])) return factFamilyQuestions(route);
  if (includesAny(lower, ["number sentences", "which sign makes", "properties of equality"])) return algebraQuestions(route);
  if (includesAny(lower, ["number names", "names of numbers", "spell word names", "write the number you hear"])) return identifyNumberQuestions(route, Math.min(maxFromRoute(route, title), 20));
  if (includesAny(lower, ["decompose", "break apart", "tens and ones", "hundreds", "thousands", "regroup", "convert to/from", "make teen numbers", "take apart teen numbers", "ways to make a number"])) return placeValueQuestions(route, title);
  if (includesAny(lower, ["histogram", "quartiles", "interquartile", "standard deviation", "scatter plot", "trends"])) return dataQuestions(route);
  if (includesAny(lower, ["factors", "divisibility"])) return [namedChoiceQuestion(route, "factor", "Which number is a factor of 12?", "3", ["3", "5", "7"], "3 is a factor of 12 because 3 x 4 = 12.")];
  if (includesAny(lower, ["fluency zone"])) return [...additionQuestions(route, 20), ...subtractionQuestions(route, 20)];
  if (includesAny(lower, ["roman numerals"])) return romanNumeralQuestions(route);
  if (includesAny(lower, ["location in a grid", "coordinate planes as maps"])) return [namedChoiceQuestion(route, "grid", "Which ordered pair names column 2, row 3?", "(2, 3)", ["(2, 3)", "(3, 2)", "(5, 1)"], "Grid locations use the horizontal position first, then the vertical position.")];
  if (includesAny(lower, ["conditionals", "truth tables", "truth values"])) return logicQuestions(route);
  if (includesAny(lower, ["customary units", "metric systems", "mixed customary units"])) return unitConversionQuestions(route);
  if (includesAny(lower, ["logarithms"])) return [namedChoiceQuestion(route, "log-product", "Which rule matches log(ab)?", "log(a) + log(b)", ["log(a) + log(b)", "log(a) - log(b)", "ab"], "The product property rewrites a logarithm of a product as a sum.")];
  if (includesAny(lower, ["law of cosines"])) return [namedChoiceQuestion(route, "law-cosines", "The Law of Cosines is most useful for which triangle information?", "two sides and the included angle", ["two sides and the included angle", "only one side", "only right angles"], "The Law of Cosines relates side lengths and the included angle.")];
  if (includesAny(lower, ["calendar", "days of the week", "months of the year", "seasons of the year", "a.m.", "p.m.", "everyday events"])) return calendarQuestions(route);
  if (includesAny(lower, ["income", "spending", "saving", "charity", "wants", "needs", "earn", "job", "least number of coins", "making change", "coin values", "coin names", "deposit", "withdrawal", "producer", "consumer", "cost to produce"])) return financialQuestions(route);
  if (includesWordAny(lower, ["ratio", "ratios", "rate", "rates", "proportion", "proportions", "scale", "percent", "discount", "tax", "interest", "markup"])) return ratioPercentQuestions(route, title);
  if (includesAny(lower, ["pythagorean", "triangle", "angle", "line", "ray", "segment", "circle", "polygon", "similarity", "congruence", "theorem", "proof", "construct", "perpendicular", "parallel", "trigonometric"])) return geometryQuestions(route, title);
  if (includesAny(lower, ["function", "transform", "slope", "linear", "quadratic", "parabola", "ellipse", "hyperbola", "conic", "foci", "limit", "continuous", "continuity", "derivative", "velocity", "rate of change", "intermediate-value"])) return functionQuestions(route, title);
  if (includesAny(lower, ["indirect comparison"])) return sizeQuestions(route, title);
  return genericChoiceQuestions(route, title);
}

export function buildExerciseSet(sourcePage: SourcePageLike): ExerciseSet | undefined {
  if (!subjectPrefixes.some((prefix) => sourcePage.path.startsWith(prefix))) return undefined;
  if (sourcePage.path.includes("/skill-plans/")) return undefined;
  if (sourcePage.skillSections?.length) return undefined;
  const depth = sourcePage.path.split("/").filter(Boolean).length;
  if (sourcePage.path.startsWith("/spanish/") ? depth < 2 : depth < 3) return undefined;
  if (/\/(videos|games|lessons|skills)$/.test(sourcePage.path)) return undefined;

  const route = sourcePage.path;
  const title = cleanTitle(sourcePage.title || titleFromPath(route));
  if (!route.startsWith("/math/")) return nonMathExerciseSet(route, title);
  const lower = `${route} ${title}`.toLowerCase();
  const max = maxFromRoute(route, title);

  let mode = "Math concept review";
  let summary = "Practice this skill with short, checkable questions.";
  let questions: ExerciseQuestion[] | undefined;

  if (lower.includes("clock") || /\btime\b/.test(lower) || lower.includes("hour") || lower.includes("minute")) {
    mode = "Time";
    summary = "Practice reading clocks and matching times.";
    questions = timeQuestions(route);
  } else if (lower.includes("number-line") || lower.includes("number line") || lower.includes("hundred-chart") || lower.includes("hundred chart")) {
    mode = "Number lines and charts";
    summary = "Practice locating, ordering, and counting numbers on lines and charts.";
    questions = numberLineQuestions(route, max);
  } else if (includesAny(lower, ["absolute-values-of-complex-numbers", "absolute values of complex numbers"])) {
    mode = "Advanced algebra";
    summary = "Practice interpreting complex numbers and their distance from zero.";
    questions = [namedChoiceQuestion(route, "complex-absolute-value", "What is the absolute value of 3 + 4i?", "5", ["5", "7", "1"], "The absolute value is the distance from zero: sqrt(3^2 + 4^2) = 5.")];
  } else if (includesAny(lower, ["right-triangle", "right triangle", "pythagorean", "trigonometric"])) {
    mode = "Geometry reasoning";
    summary = "Practice geometric relationships, right triangles, and angle reasoning.";
    questions = geometryQuestions(route, title);
  } else if (includesAny(lower, ["ruler", "inch", "centimeter", "length", "height", "area", "volume", "perimeter", "capacity", "weight", "mass"])) {
    mode = "Measurement";
    summary = "Practice measuring and comparing length, area, volume, weight, and capacity.";
    questions = measurementQuestions(route, title);
  } else if (lower.includes("place-value") || lower.includes("place value") || lower.includes("expanded-form") || lower.includes("expanded form") || lower.includes("digit")) {
    mode = "Place value";
    summary = "Practice reading digits, values, models, and expanded form.";
    questions = placeValueQuestions(route, title);
  } else if (lower.includes("fraction")) {
    mode = "Fractions";
    summary = "Practice naming, modeling, and comparing fractions.";
    questions = fractionQuestions(route, title);
  } else if (lower.includes("line-plot") || lower.includes("line plot") || lower.includes("bar-graph") || lower.includes("bar graph") || lower.includes("data") || lower.includes("graph")) {
    mode = "Data and graphs";
    summary = "Practice reading data displays and answering graph questions.";
    questions = dataQuestions(route);
  } else if (lower.includes("multiplication") || lower.includes("multiply") || lower.includes("times table")) {
    mode = "Multiplication";
    summary = "Practice equal groups, arrays, and multiplication facts.";
    questions = multiplicationQuestions(route);
  } else if (lower.includes("division") || lower.includes("divide")) {
    mode = "Division";
    summary = "Practice equal sharing, equal groups, and division facts.";
    questions = divisionQuestions(route);
  } else if ((lower.includes("variable") || lower.includes("equation") || lower.includes("missing") || (lower.includes("complete") && lower.includes("sentence"))) && !lower.includes("addition") && !lower.includes("subtraction")) {
    mode = "Equations";
    summary = "Practice completing equations and finding unknown values.";
    questions = algebraQuestions(route);
  } else if (lower.includes("identify-numbers") || lower.includes("identify numbers") || lower.includes("write-number-you-hear")) {
    mode = "Number recognition";
    summary = `Practice recognizing numerals from 1 to ${max}.`;
    questions = identifyNumberQuestions(route, max);
  } else if (lower.includes("choose-the-number-that-you-hear") || lower.includes("choose the number that you hear")) {
    mode = "Number listening";
    summary = `Practice matching a spoken number prompt to a numeral up to ${max}.`;
    questions = identifyNumberQuestions(route, max).map((question) => ({ ...question, prompt: `Teacher says: ${question.answer}. Which number did you hear?` }));
  } else if (lower.includes("learn-to-count") || lower.includes("learn to count")) {
    mode = "Counting objects";
    summary = `Practice counting small groups up to ${max}.`;
    questions = [...countObjectsQuestions(route, max), ...chooseSetQuestions(route, max)];
  } else if (lower.includes("what-number-comes-next") || lower.includes("what number comes next")) {
    mode = "Counting order";
    summary = `Practice naming the next number up to ${max}.`;
    questions = nextNumberQuestions(route, max);
  } else if (lower.includes("what-comes-next") || lower.includes("what comes next")) {
    mode = "Patterns";
    summary = "Practice recognizing and extending visual patterns.";
    questions = patternQuestions(route, title);
  } else if (lower.includes("counting-order") || lower.includes("count up") || lower.includes("put-numbers") || lower.includes("put numbers") || lower.includes("sequence") || lower.includes("before-after") || lower.includes("before, after")) {
    mode = "Counting order";
    summary = `Practice ordering and counting numbers up to ${max}.`;
    questions = [...orderNumberQuestions(route, max), ...nextNumberQuestions(route, max)];
  } else if (lower.includes("ordinal")) {
    mode = "Ordinal numbers";
    summary = "Practice position words such as first, second, and third.";
    questions = ordinalQuestions(route, max);
  } else if (lower.includes("count-out") || lower.includes("count out") || lower.includes("show numbers") || lower.includes("represent numbers")) {
    mode = "Build and represent numbers";
    summary = `Practice making sets that match numbers up to ${max}.`;
    questions = chooseSetQuestions(route, max);
  } else if (lower.includes("count")) {
    mode = "Counting and matching";
    summary = `Practice matching counted groups to numbers up to ${max}.`;
    questions = countObjectsQuestions(route, max);
  } else if (lower.includes("one-more")) {
    mode = "One more";
    summary = `Practice finding one more up to ${max}.`;
    questions = oneMoreLessQuestions(route, max, "more");
  } else if (lower.includes("one-less")) {
    mode = "One less";
    summary = `Practice finding one less up to ${max}.`;
    questions = oneMoreLessQuestions(route, max, "less");
  } else if (lower.includes("compare-groups") || lower.includes("compare-by-matching") || lower.includes("compare by matching") || lower.includes("fewer") || lower.includes("more") || lower.includes("same-number") || lower.includes("enough")) {
    mode = "Compare groups";
    summary = "Practice comparing groups by matching and counting.";
    questions = compareGroupQuestions(route);
  } else if (lower.includes("larger") || lower.includes("largest") || lower.includes("smaller") || lower.includes("smallest")) {
    mode = "Compare numbers";
    summary = "Practice comparing numerals.";
    questions = compareNumberQuestions(route, title);
  } else if (includesAny(lower, ["compare-two-numbers", "compare numbers", "greater-than", "less-than", "greater than", "less than"])) {
    mode = "Number order and comparison";
    summary = "Practice ordering and comparing numbers.";
    questions = numberOrderQuestions(route);
  } else if (lower.includes("pattern")) {
    mode = "Patterns";
    summary = "Practice recognizing and extending patterns.";
    questions = patternQuestions(route, title);
  } else if (["front", "behind", "inside", "outside", "left", "right", "top", "bottom", "above", "below", "beside", "next-to", "middle"].some((word) => lower.includes(word))) {
    mode = "Position words";
    summary = "Practice describing where objects are.";
    questions = positionQuestions(route, title);
  } else if (includesWordAny(lower, ["classify", "same", "different", "sort"])) {
    mode = "Classify and sort";
    summary = "Practice matching, sorting, and classifying objects.";
    questions = classifyQuestions(route, title);
  } else if (["long", "short", "tall", "wide", "narrow", "light", "heavy", "holds", "capacity", "size", "weight"].some((word) => lower.includes(word))) {
    mode = "Measurement words";
    summary = "Practice comparing size, weight, and capacity.";
    questions = sizeQuestions(route, title);
  } else if (["pennies", "nickels", "dimes", "quarters", "money", "coins", "change"].some((word) => lower.includes(word))) {
    mode = "Money";
    summary = "Practice recognizing coins and counting pennies.";
    questions = moneyQuestions(route, title);
  } else if (includesAny(lower, ["income", "spending", "saving", "charity", "wants", "needs", "earn", "job", "least number of coins", "making change", "coin values", "coin names"])) {
    mode = "Financial literacy";
    summary = "Practice money choices, needs, wants, earning, saving, and change.";
    questions = financialQuestions(route);
  } else if (lower.includes("add") || lower.includes("addition") || lower.includes("put-together") || lower.includes("sums-up-to") || lower.includes("cube-trains-to-add")) {
    mode = "Addition";
    summary = `Practice combining groups with sums up to ${max}.`;
    questions = additionQuestions(route, max);
  } else if (lower.includes("subtract") || lower.includes("subtraction") || lower.includes("take-away") || lower.includes("minus")) {
    mode = "Subtraction";
    summary = `Practice taking away from numbers up to ${max}.`;
    questions = subtractionQuestions(route, max);
  } else if (["circle", "triangle", "rectangle", "square", "hexagon", "rhombus", "quadrilateral", "pentagon", "shape", "solid", "sphere", "cube", "cone", "cylinder", "corner", "side", "curved", "vertices", "vertex", "edge", "face", "geometric object"].some((word) => lower.includes(word))) {
    mode = "Shapes";
    summary = "Practice naming and describing shapes.";
    questions = shapeQuestions(route, title);
  } else if (lower.includes("number")) {
    if (includesAny(lower, ["percents-of-numbers", "percents of numbers"])) {
      mode = "Percents";
      summary = "Practice finding and interpreting percents of numbers.";
      questions = ratioPercentQuestions(route, title);
    } else if (includesAny(lower, ["number-of-outcomes", "number of outcomes"])) {
      mode = "Probability";
      summary = "Practice counting possible outcomes.";
      questions = probabilityQuestions(route);
    } else if (includesAny(lower, ["rational-and-irrational", "rational and irrational", "rational-numbers", "rational numbers"])) {
      mode = "Integers and rational numbers";
      summary = "Practice classifying and comparing rational and irrational numbers.";
      questions = integerQuestions(route);
    } else if (includesAny(lower, ["number-of-days-in-each-month", "number of days in each month"])) {
      mode = "Calendar and time contexts";
      summary = "Practice calendar facts and time contexts.";
      questions = calendarQuestions(route);
    } else if (includesAny(lower, ["estimate-sums", "estimate sums", "estimate-differences", "estimate differences", "estimate-products", "estimate products", "compatible-numbers", "compatible numbers"])) {
      mode = "Decimals and rounding";
      summary = "Practice estimating with compatible numbers.";
      questions = [namedChoiceQuestion(route, "estimate", "Which is the best estimate for 198 + 403?", "600", ["600", "300", "900"], "198 is close to 200 and 403 is close to 400, so the sum is about 600.")];
    } else if (includesAny(lower, ["particular-product", "particular product", "particular-sum", "particular sum", "particular-difference", "particular difference", "particular-quotient", "particular quotient", "sum-and-difference", "sum and difference", "10-or-100-times", "10 or 100 times"])) {
      mode = "Number reasoning";
      summary = "Practice choosing numbers that satisfy operation clues.";
      questions = [namedChoiceQuestion(route, "operation-clue", "Which pair has a product of 24?", "4 and 6", ["4 and 6", "4 and 5", "3 and 7"], "4 x 6 = 24, so that pair matches the clue.")];
    } else if (includesAny(lower, ["guess-the-number", "guess the number"])) {
      mode = "Number reasoning";
      summary = "Practice using clues to identify a number.";
      questions = [namedChoiceQuestion(route, "guess", "I am greater than 20 and less than 30. I have 5 ones. What number am I?", "25", ["25", "15", "35"], "25 is between 20 and 30 and has 5 ones.")];
    } else if (includesAny(lower, ["number sentences", "which sign makes"])) {
      mode = "Equations";
      summary = "Practice writing and completing number sentences.";
      questions = algebraQuestions(route);
    } else if (includesAny(lower, ["number names", "names of numbers", "spell word names", "write-the-number-you-hear", "write the number you hear"])) {
      mode = "Number recognition";
      summary = "Practice connecting number words, spoken numbers, and numerals.";
      questions = identifyNumberQuestions(route, Math.min(max, 20));
    } else if (includesAny(lower, ["order-numbers", "order numbers", "compare-decimal-numbers", "compare decimal numbers", "compare-three-numbers", "compare three numbers", "comparing-numbers", "comparing numbers", "put-decimal-numbers", "put decimal numbers", "greatest-least", "greatest/least"])) {
      mode = "Number order and comparison";
      summary = "Practice ordering and comparing numbers.";
      questions = numberOrderQuestions(route);
    } else if (includesAny(lower, ["decompose", "break-apart", "break apart", "build-and-break-apart", "build and break apart", "tens-and-ones", "tens and ones", "hundreds", "thousands", "regroup", "convert-to-from", "convert to/from", "make-teen-numbers", "make teen numbers", "take-apart-teen-numbers", "take apart teen numbers", "ways-to-make-a-number", "ways to make a number"])) {
      mode = "Place value";
      summary = "Practice composing, decomposing, and regrouping place-value units.";
      questions = placeValueQuestions(route, title);
    } else if (includesWordAny(lower, ["even", "odd"])) {
      mode = "Even and odd numbers";
      summary = "Practice recognizing even and odd numbers.";
      questions = evenOddQuestions(route);
    } else if (includesAny(lower, ["fact families", "related facts"])) {
      mode = "Fact families";
      summary = "Practice related addition and subtraction facts.";
      questions = factFamilyQuestions(route);
    } else {
      mode = "Number skills";
      summary = "Practice matching number names, numerals, and quantities.";
      questions = [...identifyNumberQuestions(route, Math.min(max, 10)), ...countObjectsQuestions(route, Math.min(max, 10))];
    }
  } else {
    mode = reviewedMathMode(title);
    summary = "Practice this reviewed math variation with short, checkable questions.";
    questions = reviewedMathQuestions(route, title);
  }

  return {
    route,
    title,
    mode,
    summary,
    questions: questions?.length ? questions : genericChoiceQuestions(route, title)
  };
}
