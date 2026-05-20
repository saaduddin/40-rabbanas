# 40 Rabbanas

A beautiful Next.js web application dedicated to reading, listening, and tracking the 40 Rabbana Duas from the Quran.

## Features

- **Listen and Read**: Integrated audio player (`components/audio-player.tsx`) to listen to the recitations of the Duas.
- **Progress Tracking**: Track your daily streaks and build a habit with the streak badge system.
- **Bookmarking**: Save your favorite Rabbanas for quick access using the bookmark pill.
- **Authentication**: Secure authentication flow via the Quran Foundation API (`lib/qf/session.ts` & `app/api/auth/`).
- **Responsive Design**: Beautiful and accessible UI powered by Radix UI, shadcn/ui, and Tailwind CSS v4.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **State & UI**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com) & [Radix Primitives](https://www.radix-ui.com)

## Getting Started

First, clone the repository and install dependencies:

```bash
npm install
# or
pnpm install
```

### Environment Variables

You will need to set up environment variables for the Quran Foundation API and authentication flow. Create a `.env.local` file in the root directory and add the necessary configuration. Refer to the `lib/qf/config.ts` for expected keys, such as client ID and secrets.

### Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `app/` - Next.js App Router root, pages, and API routes (including OAuth 2.0 PKCE auth handlers).
- `components/` - Reusable UI components, including the audio player, toasts, badges, and base `ui/` components.
- `lib/` - Utility functions and Quran Foundation (`qf`) API integration.
- `hooks/` - Custom React hooks for mobile-responsiveness and toast notifications.

