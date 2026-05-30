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
  type: "choice";
  answer: ChoiceValue;
  choices: ExerciseChoice[];
  visual?: string;
  explanation: string;
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

function choicesForNumbers(max: number, answer: number): ExerciseChoice[] {
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
  return range(max).map((answer, index) => ({
    id: `${route}-count-${answer}`,
    prompt: "How many objects are shown?",
    instruction: "Count each object once, then choose the matching number.",
    type: "choice",
    answer,
    choices: choicesForNumbers(max, answer),
    visual: objectVisual(answer, index),
    explanation: `There ${answer === 1 ? "is" : "are"} ${answer} ${answer === 1 ? "object" : "objects"}, so the matching number is ${answer}.`
  }));
}

function identifyNumberQuestions(route: string, max: number): ExerciseQuestion[] {
  return range(max).map((answer) => ({
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
  return range(max).map((answer, index) => ({
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
    const ordered = [start, start + 1, start + 2].join(", ");
    questions.push(namedChoiceQuestion(
      route,
      `order-${start}`,
      "Which list is in counting order?",
      ordered,
      [ordered, [start + 1, start, start + 2].join(", "), [start + 2, start + 1, start].join(", ")],
      `Counting order goes ${ordered}.`
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
  const choices = lower.includes("solid") ? solidShapes : flatShapes;
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
  ].filter(([a, b]) => a + b <= max).map(([a, b], index) => ({
    id: `${route}-add-${index}`,
    prompt: `What is ${a} + ${b}?`,
    instruction: "Put the groups together and count all.",
    type: "choice",
    answer: a + b,
    choices: choicesForNumbers(max, a + b),
    visual: `${objectVisual(a)}  +  ${objectVisual(b, 1)}`,
    explanation: `${a} plus ${b} equals ${a + b}.`
  }));
}

function subtractionQuestions(route: string, max: number): ExerciseQuestion[] {
  return [
    [3, 1],
    [4, 2],
    [5, 1],
    [Math.min(max, 6), 3]
  ].filter(([a, b]) => a <= max && a > b).map(([a, b], index) => ({
    id: `${route}-subtract-${index}`,
    prompt: `What is ${a} - ${b}?`,
    instruction: "Take away and count what is left.",
    type: "choice",
    answer: a - b,
    choices: choicesForNumbers(max, a - b),
    visual: `${objectVisual(a)}  take away ${b}`,
    explanation: `${a} minus ${b} equals ${a - b}.`
  }));
}

function languageArtsQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("letter") || lower.includes("alphabet")) {
    return [
      namedChoiceQuestion(route, "letter-a", "Which choice is the letter A?", "A", ["A", "B", "C"], "The uppercase letter A is A."),
      namedChoiceQuestion(route, "letter-b", "Which choice is the letter b?", "b", ["d", "b", "p"], "The lowercase letter b has a tall line and a bump on the right.")
    ];
  }
  if (lower.includes("rhyme")) {
    return [namedChoiceQuestion(route, "rhyme", "Which word rhymes with cat?", "hat", ["hat", "dog", "sun"], "Cat and hat rhyme because they end with the same sound.")];
  }
  if (lower.includes("sound") || lower.includes("begins") || lower.includes("starts")) {
    return [namedChoiceQuestion(route, "sound", "Which word starts with /m/?", "moon", ["sun", "moon", "fish"], "Moon starts with the /m/ sound.")];
  }
  if (lower.includes("sentence") || lower.includes("grammar") || lower.includes("noun") || lower.includes("verb")) {
    return [namedChoiceQuestion(route, "grammar", "Which word is a noun?", "dog", ["run", "dog", "blue"], "Dog names a thing, so it is a noun.")];
  }
  if (lower.includes("book") || lower.includes("story") || lower.includes("text")) {
    return [namedChoiceQuestion(route, "reading", "Which part of a book tells the name of the book?", "title", ["title", "page number", "period"], "The title tells the name of the book.")];
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
  if (lower.includes("animal") || lower.includes("survive") || lower.includes("habitat")) {
    return [namedChoiceQuestion(route, "animals", "What do animals need to survive?", "food and water", ["food and water", "only toys", "only rocks"], "Animals need food and water to survive.")];
  }
  if (lower.includes("push") || lower.includes("pull") || lower.includes("force")) {
    return [namedChoiceQuestion(route, "force", "Which action is a push?", "moving a box away", ["moving a box away", "bringing a wagon closer", "sleeping"], "A push moves something away.")];
  }
  if (lower.includes("plant")) {
    return [namedChoiceQuestion(route, "plants", "What does a plant need?", "light", ["light", "shoes", "paper"], "Plants need light to grow.")];
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
  return [namedChoiceQuestion(route, "social-studies", "What does social studies help us learn about?", "people and places", ["people and places", "only numbers", "only spelling"], "Social studies includes people, places, communities, and history.")];
}

function spanishQuestions(route: string, title: string): ExerciseQuestion[] {
  const lower = title.toLowerCase();
  if (lower.includes("number") || /\b0-10\b|\b11-20\b|\b21-31\b/.test(lower)) {
    return [
      namedChoiceQuestion(route, "uno", "What does uno mean?", "one", ["one", "two", "three"], "Uno means one."),
      namedChoiceQuestion(route, "dos", "What does dos mean?", "two", ["one", "two", "ten"], "Dos means two.")
    ];
  }
  if (lower.includes("alphabet")) {
    return [namedChoiceQuestion(route, "alphabet", "Which letter name is Spanish?", "a", ["a", "apple", "after"], "The Spanish alphabet includes the letter a.")];
  }
  if (lower.includes("day") || lower.includes("week")) {
    return [namedChoiceQuestion(route, "days", "Which word is a day of the week in Spanish?", "lunes", ["lunes", "rojo", "uno"], "Lunes means Monday.")];
  }
  if (lower.includes("color")) {
    return [namedChoiceQuestion(route, "colors", "What does rojo mean?", "red", ["red", "blue", "green"], "Rojo means red.")];
  }
  return [namedChoiceQuestion(route, "spanish", "Choose the Spanish word.", "hola", ["hola", "hello", "chair"], "Hola is a Spanish greeting.")];
}

function nonMathExerciseSet(route: string, title: string): ExerciseSet {
  if (route.startsWith("/ela/")) {
    return { route, title, mode: "Language arts practice", summary: "Practice reading, writing, vocabulary, grammar, or comprehension with short questions.", questions: languageArtsQuestions(route, title) };
  }
  if (route.startsWith("/science/")) {
    return { route, title, mode: "Science practice", summary: "Practice science ideas with evidence-based questions.", questions: scienceQuestions(route, title) };
  }
  if (route.startsWith("/social-studies/")) {
    return { route, title, mode: "Social studies practice", summary: "Practice civics, geography, history, economics, and culture concepts.", questions: socialStudiesQuestions(route, title) };
  }
  if (route.startsWith("/spanish/")) {
    return { route, title, mode: "Spanish practice", summary: "Practice Spanish vocabulary, grammar, and context skills.", questions: spanishQuestions(route, title) };
  }
  return { route, title, mode: "Skill practice", summary: "Practice this skill with short, checkable questions.", questions: genericChoiceQuestions(route, title) };
}

function maxFromRoute(route: string, title: string) {
  const match = `${route} ${title}`.match(/up-to-(\d+)|up to (\d+)/i);
  return Math.min(Number(match?.[1] ?? match?.[2] ?? 5), 20);
}

export function buildExerciseSet(sourcePage: SourcePageLike): ExerciseSet | undefined {
  if (!subjectPrefixes.some((prefix) => sourcePage.path.startsWith(prefix))) return undefined;
  if (sourcePage.skillSections?.length) return undefined;
  const depth = sourcePage.path.split("/").filter(Boolean).length;
  if (sourcePage.path.startsWith("/spanish/") ? depth < 2 : depth < 3) return undefined;
  if (/\/(videos|games|lessons|skills)$/.test(sourcePage.path)) return undefined;

  const route = sourcePage.path;
  const title = cleanTitle(sourcePage.title || titleFromPath(route));
  if (!route.startsWith("/math/")) return nonMathExerciseSet(route, title);
  const lower = `${route} ${title}`.toLowerCase();
  const max = maxFromRoute(route, title);

  let mode = "Skill practice";
  let summary = "Practice this skill with short, checkable questions.";
  let questions: ExerciseQuestion[] | undefined;

  if (lower.includes("identify-numbers") || lower.includes("identify numbers")) {
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
  } else if (lower.includes("counting-order") || lower.includes("count up")) {
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
  } else if (lower.includes("compare-groups") || lower.includes("fewer") || lower.includes("more") || lower.includes("same-number") || lower.includes("enough")) {
    mode = "Compare groups";
    summary = "Practice comparing groups by matching and counting.";
    questions = compareGroupQuestions(route);
  } else if (lower.includes("larger") || lower.includes("largest") || lower.includes("smaller") || lower.includes("smallest")) {
    mode = "Compare numbers";
    summary = "Practice comparing numerals.";
    questions = compareNumberQuestions(route, title);
  } else if (lower.includes("pattern")) {
    mode = "Patterns";
    summary = "Practice recognizing and extending patterns.";
    questions = patternQuestions(route, title);
  } else if (["front", "behind", "inside", "outside", "left", "right", "top", "bottom", "above", "below", "beside", "next-to", "middle"].some((word) => lower.includes(word))) {
    mode = "Position words";
    summary = "Practice describing where objects are.";
    questions = positionQuestions(route, title);
  } else if (lower.includes("classify") || lower.includes("same") || lower.includes("different") || lower.includes("sort")) {
    mode = "Classify and sort";
    summary = "Practice matching, sorting, and classifying objects.";
    questions = classifyQuestions(route, title);
  } else if (["circle", "triangle", "rectangle", "square", "shape", "solid", "sphere", "cube", "cone", "cylinder", "corner", "side"].some((word) => lower.includes(word))) {
    mode = "Shapes";
    summary = "Practice naming and describing shapes.";
    questions = shapeQuestions(route, title);
  } else if (["long", "short", "tall", "wide", "narrow", "light", "heavy", "holds", "capacity", "size", "weight"].some((word) => lower.includes(word))) {
    mode = "Measurement words";
    summary = "Practice comparing size, weight, and capacity.";
    questions = sizeQuestions(route, title);
  } else if (["pennies", "nickels", "dimes", "quarters", "money"].some((word) => lower.includes(word))) {
    mode = "Money";
    summary = "Practice recognizing coins and counting pennies.";
    questions = moneyQuestions(route, title);
  } else if (lower.includes("add") || lower.includes("addition") || lower.includes("put-together") || lower.includes("sums-up-to") || lower.includes("cube-trains-to-add")) {
    mode = "Addition";
    summary = `Practice combining groups with sums up to ${max}.`;
    questions = additionQuestions(route, max);
  } else if (lower.includes("subtract") || lower.includes("subtraction") || lower.includes("take-away") || lower.includes("minus")) {
    mode = "Subtraction";
    summary = `Practice taking away from numbers up to ${max}.`;
    questions = subtractionQuestions(route, max);
  } else if (lower.includes("number")) {
    mode = "Number practice";
    summary = "Practice matching number names, numerals, and quantities.";
    questions = [...identifyNumberQuestions(route, Math.min(max, 10)), ...countObjectsQuestions(route, Math.min(max, 10))];
  }

  return {
    route,
    title,
    mode,
    summary,
    questions: questions?.length ? questions : genericChoiceQuestions(route, title)
  };
}
