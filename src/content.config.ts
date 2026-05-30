import { defineCollection, z } from "astro:content";

const pageLike = z.object({
  title: z.string(),
  ixlReferenceTitle: z.string().optional(),
  description: z.string(),
  navGroup: z.string(),
  order: z.number().default(100),
  heroLabel: z.string().optional(),
  cta: z.string().optional(),
  links: z.array(z.object({
    label: z.string(),
    href: z.string(),
    description: z.string().optional()
  })).default([]),
  sourceConceptCount: z.number().optional(),
  equivalentConceptSlugs: z.array(z.string()).default([])
});

const concept = z.object({
  title: z.string(),
  subject: z.string(),
  gradeBand: z.string(),
  domain: z.string(),
  summary: z.string(),
  prerequisites: z.array(z.string()).default([]),
  lessonFormats: z.array(z.string()).default([]),
  practiceTypes: z.array(z.string()).default([]),
  related: z.array(z.string()).default([])
});

const lesson = z.object({
  title: z.string(),
  subject: z.string(),
  gradeBand: z.string(),
  concept: z.string(),
  format: z.enum(["mini-lesson", "guided-practice", "video-script", "game", "diagnostic", "fluency", "skill-plan"]),
  estimatedMinutes: z.number(),
  objective: z.string(),
  checks: z.array(z.string()).default([])
});

export const collections = {
  pages: defineCollection({ type: "content", schema: pageLike }),
  subjects: defineCollection({ type: "content", schema: pageLike }),
  grades: defineCollection({ type: "content", schema: pageLike }),
  concepts: defineCollection({ type: "content", schema: concept }),
  lessons: defineCollection({ type: "content", schema: lesson })
};
