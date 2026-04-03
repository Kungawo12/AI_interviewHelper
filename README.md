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

Add your OpenAI key as well if you want the real interviewer voice:

```env
OPENAI_API_KEY=your-openai-api-key
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

## Cloud Database And Deployment

Use a hosted PostgreSQL database for production.

Recommended setup:

- App hosting: Vercel
- Database: Supabase PostgreSQL
- ORM: Prisma

Production checklist:

1. Create a Supabase project
2. Copy the pooled PostgreSQL connection string into `DATABASE_URL`
3. Add `DATABASE_URL`, `DIRECT_URL`, and `OPENAI_API_KEY` to Vercel project environment variables
4. Run:

```bash
npm run db:migrate -- --name init
```

5. Redeploy on Vercel

Your local database is only for development. The online app should point to the hosted PostgreSQL database.

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
