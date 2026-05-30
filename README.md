# SteamAhead Academy

Astro + TypeScript + TailwindCSS learning app.

## Content model

- `src/content/pages` stores public website pages.
- `src/content/subjects` stores subject landing pages.
- `src/content/grades` stores grade or course pathways.
- `src/content/concepts` stores concept equivalents.
- `src/content/lessons` stores teaching formats such as mini-lessons, guided practice, games, diagnostics, fluency, and skill plans.

Each page can store an `ixlReferenceTitle` for cross-reference. Content is original, while route names, titles, and counts can be mapped one-to-one where public source pages expose a stable structure.

## Validation

`npm run validate:content` checks that any grade pathway with `sourceConceptCount` has the same number of `equivalentConceptSlugs`, and that every referenced concept file exists.

## Commands

```bash
npm install
npm run dev
npm run build
```
