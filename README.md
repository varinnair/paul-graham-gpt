# paul-graham-gpt

Q&amp;A Bot using GPT-3.5 over Paul Graham's Essays. Based on Mckay Wrigley's [YouTube Tutorial](https://www.youtube.com/watch?v=RM-v7zoYQo0)

## Project Details

Paul Graham GPT allows you to ask questions and get answers based on Paul Graham's essays.

Essays are divided into chunks and converted into OpenAI's `text-embedding-ada-002` embeddings.

These embeddings are stored in a postgres DB in Supabase.

When the user asks a question, the question is converted into an embedding and is compared to the chunks in the database to find the most similar content (using cosine similarity of vectors). `gpt-3.5-turbo` is then asked to answer the user's question using the identified content.

## Running Locally

Requirements

1. OpenAI API key to generate text embeddings
2. Supabase account for the Postgres Database

See the schema.sql file for the script to set up the database. Run that in the SQL editor in Supabase.

3. Clone repo

```bash
git clone https://github.com/varinnair/paul-graham-gpt.git
```

4. Install dependencies

```bash
npm i
```

5. Create a `.env.local` file in the root of the repo with the following variables:

```bash
OPENAI_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

6. Run scraping script

```bash
npm run scrape
```

This scrapes Paul Graham's essays from his website and saves them to a JSON file.

7. Run embedding script

```bash
npm run embed
```

This reads the JSON file, generates embeddings for each chunk of text, and saves the results to the database.

Make sure the name of the table is correct in this script.

There is a 200ms delay between each request to avoid rate limiting.

This process will take 20-30 minutes.

8. Run app

```bash
npm run dev
```

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Credits

Thanks to [Paul Graham](https://twitter.com/paulg) for his writing.

Thanks to [Mckay Wrigley](https://twitter.com/mckaywrigley) for his [YouTube tutorial](https://www.youtube.com/watch?v=RM-v7zoYQo0) on how to make the Q&A Bot.
