# Volvet

A web app for building and maintaining **volvelles** — the concentric rotating
paper wheels used as mnemonic and combinatorial devices by figures like Ramon
Llull and Giordano Bruno.

- Define reusable **templates** for a wheel's structure: how many concentric
  rings it has, how many portions each ring is divided into, and what kind of
  content each ring holds (alphabet, numbers, a custom list of labels, or
  blank).
- Instantiate specific **wheels** from a template (or from scratch), fill in
  each portion's label, and rotate the rings by dragging them.
- Give each portion its own **meaning**, and annotate specific combinations of
  portions across rings with their own meaning — the wheel highlights any
  saved combination that matches the current alignment.

## Stack

Next.js (App Router) + TypeScript, Prisma with SQLite (via the
`better-sqlite3` driver adapter), Tailwind CSS, and Zod for validation.
Mutations are implemented as Next.js Server Actions — there is no separate
REST API.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates dev.db and applies the schema
npx prisma db seed       # loads the "Alphabetic" and "Person / Place / Action" templates
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data model

A ring's portions have a fixed index on the physical disc (0..segmentCount-1).
Rotation is a purely visual transform (`Ring.rotationDegrees`); saved
combination meanings always reference portions by their fixed index, so a
combination stays correct no matter how the wheel is currently rotated.
Rings/portions are copied from a template into a wheel at creation time, so
editing a template later never changes wheels already built from it.
