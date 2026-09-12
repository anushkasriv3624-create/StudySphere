# Deadline ⏰

> *Never study for that exam alone again.*

Every semester, university students face the same struggle: they need to find people to study with for specific courses, but there's no good way to do it. Group chats get buried, Instagram stories are ephemeral, and asking around in class is awkward. 

**Deadline** is a study session coordination platform built specifically for this problem. It connects students who need to study for the *same exact thing*, right now.

## Why this problem matters

Unlike generic study planners or roommate finders, finding a study group is an **urgency-driven** problem. Students don't plan study groups weeks ahead; they need them *now*, for *tomorrow's exam*. 

Deadline solves this by introducing a time-sensitive mechanic: 
- Sessions are automatically sorted by urgency.
- Sessions happening within 24 hours get prominent "Happening Soon" badges and live countdown timers.
- Sessions automatically archive after they've passed.

This creates a sense of "what's happening right now" on campus that static bulletin boards completely miss.

## Standout Feature: Urgency-Based Feed

The core product decision in Deadline isn't a technical feature—it's a workflow choice. The feed isn't sorted chronologically by when posts were created; it's sorted by **when the session is happening**.

A session posted today for tomorrow morning is worth 10x more than a session posted yesterday for next month. The UI reflects this with pulse animations, color-coded urgency badges, and live countdown timers to drive engagement.

## Features

- 🔐 **Authentication**: Secure email/password login via Supabase Auth
- 👤 **Profiles**: User profiles with majors, graduation years, and avatar uploads (Supabase Storage)
- 📝 **Create Sessions**: Post study sessions with course codes, topics, capacities, and formats (in-person/online)
- ⏱️ **Real-time Urgency**: Sessions sort automatically based on proximity to the deadline
- 🤝 **One-click Join**: Join sessions instantly, with hard limits enforced by the database
- 🔍 **Instant Search**: Client-side filtering by course or topic to find exactly what you need

## Tech Stack

This project was built with a modern, scalable stack focused on developer velocity and user experience.

- **Frontend**: Next.js 14 (App Router), React 18
- **Styling**: Pure CSS Modules (no external libraries) for a custom, tailored design system
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Utilities**: `date-fns` for robust time manipulation, `lucide-react` for icons

## Architecture & Technical Decisions

- **Why CSS Modules over Tailwind?** I wanted to demonstrate a deep understanding of CSS fundamentals, custom properties (variables) for theming, and responsive design without relying on utility classes.
- **Why Supabase?** PostgreSQL is perfectly suited for the relational nature of this app (`Users` ↔ `Sessions` ↔ `Session_Joins`). 
- **Row Level Security (RLS)**: The database is secured at the Postgres level. Users can only edit their own profiles, delete their own sessions, and join/leave sessions securely. Capacity limits are enforced directly in the database.

## Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/anushkasriv3624-create/deadline.git
   cd deadline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project on [Supabase](https://supabase.com)
   - Run the SQL script found in `database.sql` in your Supabase SQL Editor
   - Copy your project URL and anon key

4. **Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Paste your Supabase URL and anon key into `.env.local`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Future Improvements

If I had more time, I would implement:
- **University Verification**: Require `.edu` email addresses
- **Recurring Sessions**: Support for weekly study groups, not just one-offs
- **Push Notifications**: Reminders 1 hour before a session starts
- **In-app Chat**: A dedicated channel for each study session to coordinate last-minute details

## What I Learned

Building Deadline reinforced my understanding of real-time data synchronization and complex state management in React. Designing the urgency-sorting algorithm required careful thought about edge cases (e.g., how to handle sessions that are currently happening vs. past sessions). It was an excellent exercise in full-stack product engineering.
