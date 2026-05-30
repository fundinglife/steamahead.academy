export interface MathPathway {
  slug: string;
  badge: string;
  title: string;
  sourceSkillCount: number;
  equivalentSampleTopics: string[];
}

export const mathPathways: MathPathway[] = [
  {
    slug: "pre-k",
    badge: "P",
    title: "Pre-K",
    sourceSkillCount: 170,
    equivalentSampleTopics: ["counting to 3", "counting to 5", "position words", "shape sorting", "shape patterns", "coin recognition", "addition with cubes"]
  },
  {
    slug: "kindergarten",
    badge: "K",
    title: "Kindergarten",
    sourceSkillCount: 369,
    equivalentSampleTopics: ["skip-counting by tens", "square recognition", "subtraction within 10", "make sums to 5", "hundred chart counting"]
  },
  {
    slug: "first-grade",
    badge: "1",
    title: "First grade",
    sourceSkillCount: 357,
    equivalentSampleTopics: ["place value to 20", "equal parts", "addition facts to 20", "subtract tens", "time to the half hour"]
  },
  {
    slug: "second-grade",
    badge: "2",
    title: "Second grade",
    sourceSkillCount: 354,
    equivalentSampleTopics: ["add and subtract within 100", "measure inches", "hundreds place", "line plots", "number lines to 100"]
  },
  {
    slug: "third-grade",
    badge: "3",
    title: "Third grade",
    sourceSkillCount: 413,
    equivalentSampleTopics: ["multiplication facts", "division with equal groups", "fraction models", "area models", "number-line fractions"]
  },
  {
    slug: "fourth-grade",
    badge: "4",
    title: "Fourth grade",
    sourceSkillCount: 401,
    equivalentSampleTopics: ["decimal and fraction models", "triangle classification", "two-digit multiplication", "multi-step word problems", "unit fractions"]
  },
  {
    slug: "fifth-grade",
    badge: "5",
    title: "Fifth grade",
    sourceSkillCount: 392,
    equivalentSampleTopics: ["coordinate planes", "unlike-denominator fractions", "numerical expressions", "volume with unit cubes"]
  },
  {
    slug: "sixth-grade",
    badge: "6",
    title: "Sixth grade",
    sourceSkillCount: 387,
    equivalentSampleTopics: ["inequalities on number lines", "integers", "ratios and rates", "coordinate geometry", "equivalent expressions"]
  },
  {
    slug: "seventh-grade",
    badge: "7",
    title: "Seventh grade",
    sourceSkillCount: 366,
    equivalentSampleTopics: ["percent problems", "two-step inequalities", "integer operations", "simple probability", "proportional graphs"]
  },
  {
    slug: "eighth-grade",
    badge: "8",
    title: "Eighth grade",
    sourceSkillCount: 369,
    equivalentSampleTopics: ["slope-intercept graphs", "Pythagorean theorem", "reflections", "scatter plot trends"]
  },
  {
    slug: "algebra-1",
    badge: "A1",
    title: "Algebra 1",
    sourceSkillCount: 383,
    equivalentSampleTopics: ["systems by graphing", "linear equations", "linear inequalities", "quadratic graphs"]
  },
  {
    slug: "geometry",
    badge: "G",
    title: "Geometry",
    sourceSkillCount: 304,
    equivalentSampleTopics: ["similarity proof", "perpendicular constructions", "triangle congruence", "geometric definitions", "trigonometric word problems"]
  },
  {
    slug: "algebra-2",
    badge: "A2",
    title: "Algebra 2",
    sourceSkillCount: 388,
    equivalentSampleTopics: ["polynomial graphs", "sine and cosine graphs", "function transformations", "discrete probability distributions", "ellipses"]
  },
  {
    slug: "precalculus",
    badge: "PC",
    title: "Precalculus",
    sourceSkillCount: 309,
    equivalentSampleTopics: ["matrix equations", "complex number magnitude", "vectors", "radians and arc length", "normal probability"]
  },
  {
    slug: "calculus",
    badge: "C",
    title: "Calculus",
    sourceSkillCount: 116,
    equivalentSampleTopics: ["limits", "continuity", "implicit differentiation", "velocity as rate of change", "intermediate value theorem"]
  },
  {
    slug: "integrated-1",
    badge: "I1",
    title: "Integrated 1",
    sourceSkillCount: 193,
    equivalentSampleTopics: ["linear equations", "systems by graphing", "data comparisons", "perpendicular constructions"]
  },
  {
    slug: "integrated-2",
    badge: "I2",
    title: "Integrated 2",
    sourceSkillCount: 235,
    equivalentSampleTopics: ["quadratic graphs", "function transformations", "compound probability", "triangle congruence", "similarity proof"]
  },
  {
    slug: "integrated-3",
    badge: "I3",
    title: "Integrated 3",
    sourceSkillCount: 206,
    equivalentSampleTopics: ["polynomial graphs", "circle radius and diameter", "right triangles", "trigonometric graphs", "discrete probability"]
  }
];
