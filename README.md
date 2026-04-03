# AI Interview Helper

AI Interview Helper is a personalized mock interview platform for students and job seekers. The first version of this project is focused on collecting job context, generating tailored interview questions, capturing answers, and producing actionable feedback.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

## Current MVP Data Model

- `User`
- `InterviewProfile`
- `Resume`
- `InterviewSession`
- `Question`
- `Answer`
- `Feedback`
- `QuestionHistory`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your PostgreSQL connection string:

```bash
cp .env.example .env
```

3. Generate the Prisma client:

```bash
npm run db:generate
```

4. Create your database tables:

```bash
npm run db:migrate -- --name init
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Next Milestones

- onboarding form for job context and resume input
- question generation with OpenAI
- interview session flow
- answer scoring and coaching report
- question memory to reduce repeats

## Useful Commands

```bash
npm run dev
npm run lint
npm run db:generate
npm run db:migrate -- --name init
npm run db:studio
```

## Notes

- PostgreSQL is the recommended database for this app because the interview workflow is highly relational.
- Prisma is included to make schema management and application queries easier while you learn.
