# RecoverRight

## Project Description
A web app that is a daily recovery check-in platform designed for MLB players, physicians, and coaches. It should be built using React with shadcn UI components and TailwindCSS for styling on the frontend, a Next.js backend, and Supabase for authentication, user profile storage, and data persistence. The landing page should introduce the product and include sign-up and sign-in options where users select their role (player, physician, or coach). During sign-up, users must enter their name and age, which will be stored in their profile. Players should be able to submit a daily reflection describing how their body feels; this reflection is sent to Gemini AI, which returns a personalized recovery plan including mobility work, hydration guidance, and sleep recommendations. Once signed in, a player sees a dashboard displaying all past recordings; selecting a recording opens a detail page showing the reflection, AI insight, and associated metadata. The dashboard should also provide follow-up prompts referencing previous logs, visual progress graphs, streak tracking, and motivational feedback. Physicians should have a dashboard listing all registered players where they can view individual logs and AI feedback and send private messages to each player. Coaches should have a dashboard displaying all players with a color-coded health indicator ranging from red (high soreness or fatigue) to green (fully healthy), along with a quick summary of player condition. The interface should be visually engaging, polished, and performance-oriented, reinforcing the theme of proactive injury prevention and athlete support.

## Product Requirements Document
PRODUCT REQUIREMENTS DOCUMENT (PRD) - RecoverRight

1. Introduction and Goals

1.1 Purpose
This Product Requirements Document (PRD) details the requirements, features, and specifications for RecoverRight, a daily recovery check-in web application designed to support MLB players, physicians, and coaches in proactive injury prevention and performance management.

1.2 Product Vision
To be the most trusted, data-driven, and user-friendly platform for daily athlete recovery monitoring, leveraging AI insights to guide personalized rehabilitation and performance optimization for professional baseball players.

1.3 Goals for MVP Launch (1 Week Timeline)
1. Implement robust, role-based authentication via Supabase.
2. Ensure player daily reflection submission is fully functional.
3. Successfully integrate Gemini AI to generate personalized recovery plans from player input.
4. Display past reflections and AI insights accurately on the player dashboard.
5. Implement functional dashboards for Physicians and Coaches, displaying relevant user lists.
6. Achieve a clinical, professional, and highly usable design aesthetic using React, shadcn UI, and Tailwind CSS.
7. Achieve load times under 2 seconds, given the initial expected low data volume (15-30 users, 15-30 daily logs).

2. Target Users and Roles

RecoverRight supports three distinct user roles, each with specific permissions and dashboards:

2.1 Player
The primary user responsible for daily reporting.
Key Action: Submitting daily recovery reflections, viewing past data, and receiving AI-driven plans.

2.2 Physician
Medical staff responsible for monitoring player health data and communication.
Key Action: Viewing all registered players, accessing individual logs/AI insights, and communicating directly with players (real-time chat with attachments).

2.3 Coach
Performance staff responsible for monitoring team-wide readiness.
Key Action: Viewing all registered players with a color-coded health status indicator for quick assessment.

3. Functional Requirements

3.1 User Authentication and Profiles (Supabase)
FR1.1: Users must sign up or sign in using Supabase authentication.
FR1.2: During sign-up, the user must select one of three roles: Player, Physician, or Coach.
FR1.3: All users must provide Name and Age during sign-up, which are stored in their Supabase profile.

3.2 Player Daily Check-in System
FR2.1: Players must be able to submit a daily recovery log.
FR2.2: The daily log submission form must capture the following structured data in addition to free-form text:
    a. Specific Pain Locations (Select/Tagging mechanism).
    b. Pain Severity (Numerical Scale, e.g., 1-10).
    c. Energy Levels (Numerical Scale or predefined levels).
    d. Soreness Levels (Numerical Scale or predefined levels).
FR2.3: The free-form text reflection must be captured for processing by Gemini AI.

3.3 Gemini AI Integration and Output
FR3.1: Upon reflection submission, the data (including structured inputs and free-form text) must be securely sent to the Gemini API.
FR3.2: The Gemini output must be a structured, step-by-step recovery plan, including:
    a. Mobility/Workout Plan: Specific stretches/workouts, required duration, and intensity level.
    b. Equipment Guidance: Suggestions for necessary or beneficial equipment.
    c. Nutritional/Rest Plan: Specific guidance on food/drink intake and rest protocols for optimal recovery.
FR3.3: The AI-generated plan (AI Insight) must be stored alongside the player's reflection data in Supabase.

3.4 Player Dashboard and Data Visualization
FR4.1: The Player Dashboard must display a reverse-chronological list of all past submitted recordings (log entries).
FR4.2: Selecting a past recording must navigate to a detail view showing the original Reflection, the AI Insight, and associated metadata (date/time).
FR4.3: The dashboard must display Streak Tracking: the total number of consecutive days the player has logged data, presented in a visually engaging manner.
FR4.4: The dashboard must display a visualization (bar chart/histogram) showing the frequency of specific pain mentions over time (derived from structured input data).
FR4.5: The dashboard must display randomized, motivational feedback upon every login.
FR4.6: Diagnostic Follow-Up Prompts must be displayed upon login:
    a. First Login: Prompt reads simply: "Tell me how you feel."
    b. Subsequent Logins: Prompts must be diagnostic, referencing the most recent inputs (e.g., "You mentioned shoulder stiffness two days ago; is that still present?"). Prompts should only reference relevant, previously logged issues requiring updates.

3.5 Physician Dashboard
FR5.1: Physicians must see a list of all registered players.
FR5.2: Physicians must be able to select any player to view their complete log history, including raw reflections and AI insights.
FR5.3: A real-time messaging system must be implemented to allow private communication between the Physician and the selected Player.
FR5.4: The messaging system must persist message history, accessible upon reopening the chat.
FR5.5: Physicians must be able to attach files (e.g., custom workout PDFs) to messages sent to players.

3.6 Coach Dashboard
FR6.1: Coaches must see a list of all registered players.
FR6.2: For each player, a color-coded Health Indicator must be displayed, summarizing the player's current status for game readiness.
FR6.3: The color coding must be derived from an AI-generated health score associated with the latest player input:
    a. Green: Fully healthy/Ready to play.
    b. Yellow/Orange: Caution/Moderate risk (e.g., slight soreness).
    c. Red: High risk/Unfit to play (e.g., severe soreness reported).
FR6.4: The indicator color must reflect any worsening condition across sequential inputs.
FR6.5: A quick summary of the player's current condition (derived from the latest log) must be visible next to the indicator.

FR7. Real-Time Communication and Player Notifications
FR7.1: Players must receive a visual notification on their dashboard when a Physician sends them a new message.
FR7.2: Players must be able to view and download attachments sent by Physicians via the messaging interface.

4. Non-Functional Requirements

4.1 Technology Stack
NFR1.1: Frontend: React with TypeScript (implied), styled using Tailwind CSS and built around shadcn UI components for a professional look.
NFR1.2: Backend/API: Next.js framework.
NFR1.3: Database/Auth: Supabase.
NFR1.4: AI Processing: Gemini API integration.

4.2 Performance and Scalability
NFR2.1: All primary dashboard and log viewing operations must complete loading in under 2.0 seconds, assuming the initial low data volume (15-30 users/30 daily logs).
NFR2.2: Data fetching must be optimized to handle time-series data efficiently (relevant for graphs and log history).

4.3 Security and Data Integrity
NFR3.1: All data transmission between client, server, and Supabase must use HTTPS/SSL.
NFR3.2: Role-based access control (RBAC) must be enforced via Supabase Row Level Security (RLS) to ensure users only access data permitted by their role (e.g., Coaches cannot view private messages).

4.4 Design and Usability (Aesthetic)
NFR4.1: The interface must be clinical, professional, clean, and sharp, suitable for high-ranking officials and professional athletes.
NFR4.2: Navigation must be intuitive, featuring a persistent, easily accessible navigation bar across all primary views.
NFR4.3: Performance focus implies minimal visual clutter that could impede fast data absorption.

5. Data Model Considerations (Supabase Schema Hints)

Schema should support:
*   User profiles (Name, Age, Role).
*   Player Log Entries (Timestamp, Free Text, Structured Pain Data).
*   AI Recovery Plan Outputs (Linked to Log Entry).
*   Physician-Player Messages (Timestamp, Sender ID, Receiver ID, Content, Attachment Links).
*   Health Score (Derived value used by Coach Indicator).

## Technology Stack
# RecoverRight Technology Stack Documentation

## 1. Overview

This document outlines the recommended technology stack for the RecoverRight project. The stack prioritizes modern, scalable, performant, and developer-friendly tools to meet the aggressive MVP timeline while ensuring a polished, clinical, and professional user experience essential for MLB personnel.

## 2. Frontend Technologies

The frontend will be built as a high-performance Single Page Application (SPA) focused on visual polish and responsiveness.

| Technology | Version / Library | Justification |
| :--- | :--- | :--- |
| **Core Framework** | React (with Vite/Next.js Client Components) | Industry standard, component-based architecture, excellent ecosystem support, and high performance necessary for complex dashboards. |
| **Styling & UI** | Tailwind CSS | Utility-first framework enabling rapid development of the required clean, sharp, and professional design aesthetic without writing custom CSS files, ensuring design consistency. |
| **Component Library** | shadcn/ui | Provides accessible, customizable, and aesthetically clean components that align perfectly with the desired "clinical and professional" look. Components are built on Radix UI and leverage Tailwind CSS. |
| **Data Visualization** | Recharts or Chart.js (integrated via React wrapper) | Necessary for rendering required player progress graphs (e.g., pain frequency visualization) in a performant and visually appealing manner on the player dashboard. |
| **State Management** | React Context API / Zustand (if needed) | For an application of this scope and MVP timeline, standard React hooks and Context are sufficient. Zustand will be considered if global state management complexity increases, prioritizing simplicity and minimal boilerplate. |

## 3. Backend & API Technologies

The backend leverages Next.js for server-side capabilities, API routing, and seamless integration with the frontend.

| Technology | Version / Library | Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Provides full-stack capabilities, enabling powerful API routes for handling interactions with Supabase and the Gemini AI service, while maintaining excellent performance characteristics. |
| **API Routes** | Next.js API Routes | Used for securing API keys (e.g., for Gemini access) and acting as the secure intermediary between the frontend and third-party services. |

## 4. Database, Authentication, and Data Services

Supabase is selected as the unified backend service to accelerate development, especially concerning authentication and real-time features.

| Technology | Version / Library | Justification |
| :--- | :--- | :--- |
| **Database & Auth** | Supabase (PostgreSQL) | Provides robust, managed PostgreSQL database, integrated authentication (handling Player/Physician/Coach roles), and straightforward data management. Supports Row Level Security (RLS) for data access control. |
| **Realtime Functionality** | Supabase Realtime | Essential for implementing the real-time, persistent messaging system between physicians and players without needing to manage separate WebSocket servers. |
| **Storage** | Supabase Storage | Recommended for storing attachments sent by physicians in the messaging system (e.g., custom workout PDFs or images). |

## 5. Artificial Intelligence Integration

| Technology | Version / Library | Justification |
| :--- | :--- | :--- |
| **Core AI Model** | Google Gemini API | Selected to process the detailed player reflection data (including pain points, severity, energy, soreness) and generate structured, personalized, and actionable recovery plans, addressing all requirements for mobility, hydration, and sleep guidance. |
| **Integration Method** | Next.js API Routes | The Next.js backend will securely call the Gemini API, injecting the required prompt engineering to ensure the output adheres to the specified structured format (step-by-step plan, equipment recommendations). |

## 6. Supporting Tools and Development Workflow

| Tool/Service | Purpose | Justification |
| :--- | :--- | :--- |
| **Version Control** | Git / GitHub | Standard for collaborative development, branching, and code review. |
| **Code Quality** | ESLint & Prettier | Ensures clean, consistent code style across the React/Next.js codebase, crucial for maintaining quality during an aggressive timeline. |
| **Testing** | Jest / React Testing Library | Recommended for unit and integration testing, focusing initially on core logic (authentication, data submission, AI request handling). |
| **Deployment** | Vercel (Recommended for Next.js) | Optimal platform for deploying Next.js applications, offering excellent performance optimizations, serverless functions for API routes, and simple CI/CD integration. |

## 7. Performance Considerations

The stack is inherently performant:

*   **Client-Side Rendering (CSR) / Static Generation (SSG) where appropriate in Next.js** ensures quick initial load times, supporting the sub-2-second load requirement.
*   **Tailwind CSS and React** minimize runtime overhead on the client.
*   **Supabase** offers fast data retrieval, and with an initial low user volume (15-30 daily logs), performance tuning will focus primarily on efficient Supabase queries and optimized AI latency.
*   **Data Fetching Optimization:** Use React Query (or similar patterns within Next.js Server Components/Client hooks) to manage caching and prevent unnecessary re-fetching of static dashboard data (like streak counts).

## Project Structure
# RecoverRight Project Structure Document

## 1. Overview and Philosophy

This document outlines the file and folder organization for the RecoverRight application. The structure prioritizes clear separation between frontend (React/Next.js Client Components) and backend logic (Next.js API Routes, Supabase integration), adhering to modern Next.js conventions for optimal performance and maintainability. We emphasize a modular approach to support the MVP timeline while allowing for future feature expansion (e.g., advanced analytics, complex messaging).

## 2. Root Directory Structure

```
/recoverright
├── .next/                   # Next.js build output (ignored by Git)
├── node_modules/            # Project dependencies (ignored by Git)
├── public/                  # Static assets (images, favicons)
├── src/                     # Primary application source code
│   ├── app/                 # Next.js App Router structure
│   ├── components/          # Reusable UI components (Shadcn/Tailwind based)
│   ├── lib/                 # Utility functions, hooks, and external service integration
│   ├── styles/              # Global CSS/Tailwind configurations (if needed outside of tailwind.config.ts)
│   └── types/               # TypeScript definitions and interfaces
├── .env.local               # Environment variables (Supabase keys, Gemini API key)
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts       # Tailwind configuration file
└── tsconfig.json
```

## 3. Detailed `src/` Directory Breakdown

### 3.1. `src/app/` (Next.js App Router)

This directory handles routing, layout, and top-level page structures.

```
src/app/
├── (auth)/                  # Group for public/authentication routes (Login, Signup)
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx         # Sign-in page (Role selection logic)
│   └── signup/
│       └── page.tsx         # Sign-up page (Role selection and profile data entry)
├── (dashboard)/             # Group for authenticated, role-specific dashboards
│   ├── layout.tsx           # Shared layout for authenticated users (incl. Navbar)
│   ├── coach/
│   │   └── page.tsx         # Coach Dashboard (Player list, color-coded health status)
│   ├── player/
│   │   ├── page.tsx         # Player Dashboard (Logs, streaks, prompts, motivational feedback)
│   │   └── log/[id]/
│   │       └── page.tsx     # Player Log Detail View (Reflection, AI Insight)
│   └── physician/
│       └── page.tsx         # Physician Dashboard (Player roster, viewing logs, initiating messages)
├── api/                     # Next.js API Routes (Backend integration logic)
│   ├── auth/[...nextauth]/  # (If using NextAuth, otherwise omitted if using Supabase directly)
│   ├── gemini/
│   │   └── route.ts         # Endpoint to proxy Gemini AI requests
│   ├── logs/
│   │   └── route.ts         # CRUD for player reflections/logs
│   └── messages/
│       └── route.ts         # API for sending/receiving real-time messages (or webhook setup)
├── globals.css              # Global styles (imported in layout.tsx)
├── layout.tsx               # Root layout (defines HTML structure)
└── page.tsx                 # Root entry point (redirects unauthenticated users to /login)
```

### 3.2. `src/components/`

This directory holds modular, reusable React components, leveraging Shadcn UI where possible.

```
src/components/
├── ui/                      # Wrapper components around shadcn/ui primitives (Buttons, Cards, Input)
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
├── layout/                  # Structural components
│   ├── Navbar.tsx           # Main navigation bar
│   └── Sidebar.tsx          # Role-specific navigation elements (if used)
├── auth/
│   ├── RoleSelector.tsx     # Component for selecting Player/Physician/Coach during sign-up
├── player/
│   ├── DailyReflectionForm.tsx  # Form for inputting reflection, pain scores, energy levels
│   ├── LogDetailView.tsx    # Displays reflection, metadata, and AI response
│   ├── DashboardSummary.tsx # Streak counter, motivational feedback display
│   └── FollowUpPrompts.tsx  # Logic and rendering for diagnostic prompts
├── physician/
│   ├── PlayerRosterList.tsx # List of managed players
│   └── MessageCenter.tsx    # Interface for viewing history and sending private messages
├── coach/
│   ├── PlayerHealthTable.tsx# Main component showing player list and color-coded indicator
│   └── HealthIndicatorBadge.tsx # Component to render R/Y/G status
├── dataViz/                 # Visualization components (e.g., charts)
│   └── PainFrequencyChart.tsx # Bar chart for pain location frequency
└── messaging/
    └── RealTimeChat.tsx     # Component handling Supabase Realtime for messaging
```

### 3.3. `src/lib/`

Contains shared logic, configuration, and service clients.

```
src/lib/
├── supabase/
│   ├── client.ts            # Client-side Supabase instance (for browser use)
│   └── server.ts            # Server-side Supabase instance (for API routes/Server Components)
├── services/
│   ├── aiService.ts         # Logic for formatting input and calling the Gemini API
│   ├── logProcessor.ts      # Functions to parse raw log data for visualization/scoring
│   └── healthScoring.ts     # Algorithm to derive the Coach Health Indicator score
├── hooks/
│   ├── usePlayerLogs.ts     # Custom hook for fetching player-specific log data
│   └── useRealtimeMessages.ts # Custom hook for Supabase Realtime subscription
├── utils.ts                 # General utility functions (date formatting, data parsing)
└── constants.ts             # Hardcoded strings, API keys placeholders (if not using .env)
```

### 3.4. `src/types/`

All TypeScript interfaces and types, crucial for a polished React/TS project.

```
src/types/
├── index.d.ts               # Core types re-export
├── user.ts                  # User roles and profile types (PlayerProfile, PhysicianProfile, etc.)
├── log.ts                   # Structure for PlayerReflection Log (including pain fields)
├── ai.ts                    # Interface for Gemini AI output structure (Structured Plan)
├── message.ts               # Message object structure (for real-time chat)
└── dashboard.ts             # Types related to visualization data (e.g., StreakData)
```

## 4. Supabase Schema Dependencies (Conceptual Mapping)

While not files, understanding the required tables informs API endpoints and service logic:

1.  **`profiles`**: Stores base user data (ID from Auth, name, age, role).
2.  **`player_logs`**: Stores daily reflection text, structured pain data (location, severity), energy/soreness levels, and the derived `health_score` (for coach view).
3.  **`ai_insights`**: Stores the structured recovery plan generated by Gemini, linked to `player_logs`.
4.  **`messages`**: Stores real-time chat history between physicians and players (sender\_id, receiver\_id, content, timestamp, attachment\_url).
5.  **`player_coach_mapping`**: (If necessary) To define which coach manages which players.

## Database Schema Design
SCHEMADESIGN: RecoverRight Database Schema

1. Core User Management (Supabase Auth Integration)

Table: users
Description: Stores core user information linked directly to Supabase auth profiles.
| Column Name | Data Type | Constraints/Notes |
|---|---|---|
| id | UUID | Primary Key (Foreign Key to auth.users) |
| email | TEXT | NOT NULL, UNIQUE (Handled by Supabase Auth) |
| role | ENUM ('player', 'physician', 'coach') | NOT NULL, Determines dashboard access and permissions |
| created_at | TIMESTAMPZ | Default NOW() |

Table: profiles
Description: Stores extended user profile details, including required signup data (name, age).
| Column Name | Data Type | Constraints/Notes |
|---|---|---|
| user_id | UUID | Primary Key, Foreign Key references users(id) |
| full_name | TEXT | NOT NULL |
| age | INTEGER | NOT NULL, CHECK (age > 15) |
| team_id | INTEGER | NULL, Foreign Key references teams (for Players/Coaches) |

2. Player Tracking and Reflection Data

Table: player_logs
Description: Stores each daily recovery reflection submission by a player.
| Column Name | Data Type | Constraints/Notes |
|---|---|---|
| id | BIGINT | Primary Key, Auto-increment |
| player_id | UUID | NOT NULL, Foreign Key references users(id) |
| reflection_text | TEXT | The free-form daily input. |
| pain_location_tags | TEXT[] | Array of text tags (e.g., ['shoulder', 'hamstring']) |
| pain_severity_level | INTEGER | Scale 1-10 (for pain mentioned) |
| energy_level | INTEGER | Scale 1-10 |
| soreness_level | INTEGER | Scale 1-10 |
| submitted_at | TIMESTAMPZ | NOT NULL, Default NOW() |
| health_score | DECIMAL(4,2) | Calculated score (0.00 to 100.00) used for Coach Indicator |
| ai_insight_id | BIGINT | Foreign Key references ai_insights(id) (Can be NULL until processed) |

Table: ai_insights
Description: Stores the structured recovery plan generated by Gemini AI based on the player log.
| Column Name | Data Type | Constraints/Notes |
|---|---|---|
| id | BIGINT | Primary Key, Auto-increment |
| log_id | BIGINT | Foreign Key references player_logs(id), UNIQUE |
| mobility_plan | JSONB | Structured workout/stretch plan (duration, intensity, equipment). |
| nutrition_rest_plan | JSONB | Structured food/drink/rest guidance. |
| generated_at | TIMESTAMPZ | Default NOW() |

3. Physician and Coaching Structure

Table: teams
Description: Defines organizational structure (e.g., MLB Team X). Required for associating staff and players.
| Column Name | Data Type | Constraints/Notes |
|---|---|---|
| id | INTEGER | Primary Key, Auto-increment |
| team_name | TEXT | NOT NULL, UNIQUE |
| organization_level | TEXT | E.g., 'MLB', 'MiLB', 'Training Staff' |

Note: Physicians and Coaches will link to `teams` via the `profiles` table (team_id).

4. Communication (Physician Messaging)

Table: conversations
Description: Manages threads between a Physician and a Player.
| Column Name | Data Type | Constraints/Notes |
|---|---|---|
| id | BIGINT | Primary Key, Auto-increment |
| player_id | UUID | NOT NULL, Foreign Key references users(id) |
| physician_id | UUID | NOT NULL, Foreign Key references users(id) |
| created_at | TIMESTAMPZ | Default NOW() |
| last_message_at | TIMESTAMPZ | For sorting dashboards |
| CONSTRAINT conversation_unique UNIQUE (player_id, physician_id) | Enforces one thread per pair |

Table: messages
Description: Stores the real-time chat history.
| Column Name | Data Type | Constraints/Notes |
|---|---|---|
| id | BIGINT | Primary Key, Auto-increment |
| conversation_id | BIGINT | NOT NULL, Foreign Key references conversations(id) |
| sender_id | UUID | NOT NULL, References users(id) |
| content | TEXT | The message body. |
| sent_at | TIMESTAMPZ | NOT NULL, Default NOW() |
| read_by_recipient | BOOLEAN | Default FALSE (Used for visual notification tracking) |

Table: message_attachments
Description: Stores metadata for files attached by physicians (e.g., tailored workout PDFs).
| Column Name | Data Type | Constraints/Notes |
|---|---|---|
| id | BIGINT | Primary Key, Auto-increment |
| message_id | BIGINT | NOT NULL, Foreign Key references messages(id) |
| file_path | TEXT | Supabase Storage URL/Path for the attachment. |
| file_type | TEXT | MIME type or simple descriptor (e.g., 'PDF', 'Video') |
| uploaded_at | TIMESTAMPZ | Default NOW() |

5. Data Analysis & Visualization Support

Table: pain_tag_history
Description: Derived table or materialized view (or handled client-side/via RLS views) to track frequency of specific pain mentions for visualization.
*Note: For simplicity and MVP speed, this data will primarily be aggregated from `player_logs.pain_location_tags` on query, but the structure implies a relationship here.*

Relationship Notes:
1.  **One-to-Many (Player to Logs):** One player can have many daily `player_logs`.
2.  **One-to-One (Log to AI Insight):** Each `player_log` has exactly one resulting `ai_insight`.
3.  **Many-to-Many (Physician/Player to Messages):** Handled via the `conversations` bridge table.
4.  **One-to-Many (Team to Users):** A team can have many associated players/coaches/physicians (linked via `profiles.team_id`).

Performance Considerations:
*   Indexing on `player_id` in `player_logs` and `conversation_id` in `messages` is crucial for fast retrieval on dashboards.
*   The `health_score` in `player_logs` is essential for near real-time indicator generation for coaches, avoiding complex on-the-fly AI recalculation during coach dashboard loads.
*   The small initial user base (15-30) means standard Supabase performance tuning should suffice for the 2-second load requirement.

## User Flow
USERFLOW DOCUMENTATION: RECOVERRIGHT

Project: RecoverRight - Daily Recovery Check-in Platform
Document Version: 1.0
Date: October 26, 2023

---
1. OVERVIEW
---
This document details the primary user flows for the RecoverRight platform, covering authentication, and the core workflows for the three user roles: Player, Physician, and Coach. The flows prioritize a clinical, professional aesthetic and fast performance, adhering to the MVP timeline focus on core functionality.

---
2. CORE USER ROLES AND AUTHENTICATION FLOW
---

2.1. Public Landing Page Flow (Pre-Login)

1.  **Entry Point:** User lands on the RecoverRight public page.
2.  **Visuals:** Clean, professional design featuring product value proposition (proactive injury prevention, data-driven recovery).
3.  **Action Choices:** Prominent buttons/links for "Sign In" and "Sign Up".

2.2. Sign-Up Flow (All Roles)

1.  **Step 1: Role Selection:** User clicks "Sign Up". Prompted to select role: [Player], [Physician], [Coach]. (Role is stored for access control.)
2.  **Step 2: Credentials & Profile:** User provides Email, Password.
3.  **Step 3: Role-Specific Data Capture:**
    *   *All Roles:* Enter Full Name, Age.
    *   *Player Specific:* (None additional required in MVP, but structure allows for future team/position capture).
4.  **Step 4: Submission & Confirmation:** Data sent to Supabase Auth & Profiles table. Success redirects to respective role dashboard.

2.3. Sign-In Flow

1.  **Step 1: Credentials Input:** User inputs Email and Password.
2.  **Step 2: Authentication:** Supabase verifies credentials.
3.  **Step 3: Role Redirection:** Based on the role stored in the profile, the user is redirected:
    *   Player -> Player Dashboard (Flow 3.1)
    *   Physician -> Physician Dashboard (Flow 4.1)
    *   Coach -> Coach Dashboard (Flow 5.1)

---
3. PLAYER USER FLOW
---

3.1. Player Dashboard (First Login)

1.  **Navigation:** Persistent Nav Bar (Dashboard, History, Messages).
2.  **Data Load:** Fast load (< 2s) retrieves historical logs and streak data.
3.  **Initial State:** Displays "Streak Counter" (Days tracking) and randomized Motivational Feedback.
4.  **Follow-up Prompt:** Displays the default prompt: "Tell me how you feel."
5.  **Action:** Player clicks "New Daily Check-in" button to proceed to the Reflection Form.

3.2. Player Dashboard (Subsequent Logins)

1.  **Data Load:** Loads historical data.
2.  **Follow-up Prompt (Diagnostic Logic):** System queries the last submission to generate a relevant, diagnostic prompt.
    *   *Example 1 (Shoulder Stiffness):* "You mentioned shoulder stiffness two days ago; is that still present?"
    *   *Example 2 (Fatigue):* "How is your energy level today compared to yesterday when you reported high fatigue?"
3.  **Visualization:** Displays progress graphs (e.g., Pain Frequency visualization based on past inputs).
4.  **Action:** Player can click "New Daily Check-in" or view past history.

3.3. Daily Reflection Submission Flow

1.  **Access:** Initiated from the Dashboard.
2.  **Form Fields (Wireframe Description):**
    *   Free-Form Text Area: "Describe how your body feels today..."
    *   Pain Location Selector (Interactive body map or dropdown list).
    *   Pain Severity Scale (Slider/Input: 1-10).
    *   Energy Level Selector (Scale or predefined options).
    *   Soreness Level Selector (Scale or predefined options).
3.  **Submission:** User clicks "Submit Reflection." Data is saved to Supabase (Logs table).
4.  **AI Processing:** Reflection data is sent to the Next.js backend, which forwards it to Gemini AI.
5.  **AI Response Handling:** Backend receives structured AI response (Recovery Plan).
    *   *Health Score Calculation:* AI output is used to generate a recovery/health score (0-100) which determines the Coach indicator color. This score is saved.
6.  **Redirection:** User is redirected back to the Dashboard.

3.4. Player History/Log Detail View Flow

1.  **Access:** Player navigates to the "History" tab or clicks a log summary card on the Dashboard.
2.  **Log List (Dashboard):** Displays summary cards of past entries (Date, Summary Snippet).
3.  **Detail Page:** Upon selection, the page displays:
    *   **Metadata:** Date, Time, User Input scores (Severity, Energy, Soreness).
    *   **Original Reflection:** The text submitted by the player.
    *   **AI Insight (Structured Plan):**
        *   Mobility/Workout Plan: Step-by-step instructions, duration, intensity, suggested equipment.
        *   Nutrition/Rest Plan: Recommended foods, hydration goals, and rest periods.
    *   **Physician Messages:** A dedicated section showing any relevant, threaded messages from their assigned physician. (Real-time chat interface integration here, supporting text and attachments).

---
4. PHYSICIAN USER FLOW
---

4.1. Physician Dashboard Flow

1.  **Navigation:** Persistent Nav Bar (Dashboard, Patients, Messages).
2.  **Patient Listing:** Default view lists all registered players (Patient List).
3.  **Data Load:** Displays Player Name, Last Check-in Date, and a summary snippet/health score.
4.  **Unread Message Indicator:** Visual notification on the dashboard if any player has messaged them or if they have new unread replies in active threads.
5.  **Action:** Click on a player to view details or navigate to the main Messaging hub.

4.2. Viewing Individual Player Logs Flow

1.  **Access:** Physician clicks a player from the Patient List.
2.  **Player Summary View:** Shows aggregated data (e.g., last 7 days of pain scores).
3.  **Log Review:** Physician can navigate through the player's historical logs (identical view to Flow 3.4, but with physician-specific actions).
4.  **Physician Action:** Button to "Initiate/Continue Private Chat" with the player.

4.3. Physician Messaging Flow (Real-Time)

1.  **Initiation:** Physician selects a player, opening the chat interface.
2.  **Interface:** Clean, real-time chat window displaying message history. Supports text input and an "Attach File" option (for sending tailored workout documents/videos).
3.  **Sending:** Messages are stored in Supabase (Messages table) and instantly pushed to the player's interface.
4.  **History:** All prior correspondence is maintained and accessible within this player-specific thread.

---
5. COACH USER FLOW
---

5.1. Coach Dashboard Flow

1.  **Navigation:** Persistent Nav Bar (Dashboard, Team Overview).
2.  **Team Overview Listing (Primary View):** Displays all assigned or visible players.
3.  **Health Indicator Integration:** Each player row features the color-coded Health Indicator:
    *   **Green:** High health score (Player likely fully healthy/ready).
    *   **Yellow:** Moderate health score (Caution/Monitoring needed).
    *   **Red:** Low health score (High soreness/fatigue; potential restriction needed).
4.  **Quick Summary:** Displays a brief text summary derived from the latest log or health score interpretation (e.g., "Mild lower back stiffness reported").
5.  **Data Visualization:** Displays the visualization of the total days tracked (streak) across the team, potentially showing the team average streak.
6.  **Action:** Click on a player row to view the detailed Player Log Review (similar to 4.2, but read-only access to reflections and AI insights). Coaches do not have messaging capabilities in the MVP.

## Styling Guidelines
RECOVERRIGHT: STYLING GUIDELINES DOCUMENT (V1.0)

1. INTRODUCTION AND DESIGN AESTHETIC

1.1. Design Philosophy
RecoverRight aims for a clinical, professional, and sharp aesthetic that instills confidence in high-ranking personnel (physicians, coaches). The design must prioritize clarity, data accuracy, and performance, reinforcing the theme of proactive, data-driven athlete support. While aiming for polish, the MVP prioritizes functionality and clean code, with visual flourishes added incrementally.

1.2. Core Principles
*   **Clarity Over Clutter:** Every element must serve a clear purpose. Whitespace is essential for readability and professionalism.
*   **Data Integrity:** Visualizations and status indicators (like the Coach Health Indicator) must be immediately understandable and accurately reflect underlying data.
*   **Performance-Oriented:** Styling choices must not impede the sub-2-second load time goal. Utilize efficient components (shadcn UI) and minimal heavy animations initially.
*   **Professional Navigation:** Intuitive, persistent navigation is required across all user roles.

2. COLOR PALETTE

The palette balances clinical seriousness with subtle technological cues, avoiding overly vibrant or distracting colors.

| Name | Hex Code | Usage | Notes |
| :--- | :--- | :--- | :--- |
| Primary (Brand/Action) | #0047AB | Primary buttons, active navigation states, key data points. (Deep Royal Blue) | Suggests trust and professionalism. |
| Secondary (Accent/Success) | #228B22 | Success indicators, positive streak counters, fully healthy status (Green). | Standard success metric. |
| Tertiary (Warning/Attention) | #FFD700 | Moderate warning states, mid-range player health indicators (Gold/Yellow). | Indicates caution required. |
| Danger (Critical Status) | #DC143C | Critical status (Red), high pain scores, error states. | Immediate attention required. |
| Background/Base | #F8F9FA | Primary application background (Light Gray/Off-White). | Clean, high-contrast background for readability. |
| Surface/Card | #FFFFFF | Card backgrounds, modal surfaces, input fields. | Provides separation from the base background. |
| Text Primary | #212529 | Main body text, headers. | Dark charcoal for maximum contrast. |
| Text Secondary | #6C757D | Helper text, metadata, disabled states. | Subtle contrast for less critical information. |

2.1. Coach Health Indicator Color Mapping (Derived from AI Health Score):
*   **Green (#228B22):** Fully healthy, ready to play.
*   **Yellow-Green (e.g., #9ACD32):** Minor stiffness/fatigue, monitor closely.
*   **Yellow (#FFD700):** Moderate issue present, requires attention/modification.
*   **Orange (e.g., #FFA500):** Significant issue, potential restriction.
*   **Red (#DC143C):** Severe symptoms, high risk of non-participation.

3. TYPOGRAPHY

Typography must be highly legible across all screen sizes, suitable for dense data review by professionals. We rely on Tailwind CSS defaults leveraging system fonts for optimal performance and native rendering, ensuring a clean, sans-serif experience.

3.1. Font Family
System default sans-serif stack (e.g., Inter, Helvetica Neue, Arial).

3.2. Sizing Hierarchy (Tailwind Defaults Mapping)
| Element | Sizing Reference | Usage |
| :--- | :--- | :--- |
| Page Titles (H1) | text-4xl, font-bold | Primary dashboard titles. |
| Section Headers (H2) | text-2xl, font-semibold | Section headers within dashboards (e.g., "Past Logs"). |
| Component Titles (H3) | text-lg, font-medium | Titles for widgets and cards. |
| Body Text | text-base | Standard paragraph content, AI plan descriptions. |
| Small/Metadata | text-sm | Timestamps, helper text, navigation links. |
| Form Labels/Inputs | text-base | Input fields and form labels. |

4. COMPONENT STYLING (SHADCN UI)

We leverage shadcn UI components, applying the established color palette and spacing conventions for consistency.

4.1. Buttons
*   **Primary Action:** Use Primary Color (#0047AB). Solid fill for critical actions (Submit Reflection, Sign In). Slightly rounded corners (e.g., `rounded-md`).
*   **Secondary/Ghost:** Subtle borders or background color only for lower-priority actions (Cancel, View Details).

4.2. Cards and Surfaces
Cards utilize the Surface color (#FFFFFF) with soft shadows (light elevation) to separate content blocks cleanly. Generous padding within cards to accommodate structured data.

4.3. Navigation Bar (Persistent)
*   Position: Fixed at the top of the viewport.
*   Background: Slightly darker than the base background (e.g., #FFFFFF with a subtle shadow) to ensure prominence.
*   Active State: Highlighted using the Primary Color (#0047AB) for the current route/role dashboard.

4.4. Forms and Inputs
Inputs must be sharp and clear. Focus states must clearly use the Primary Color to indicate user interaction readiness. This is crucial for the detailed player reflection entry.

4.5. Data Visualization Styling
Charts (Bar charts for pain frequency, streak counters) must adhere strictly to the palette:
*   **Streak Counter:** Large, bold text using Secondary (Success) color, perhaps with a subtle, flashy border effect only for MVP polish consideration.
*   **Pain Frequency Bars:** Primary color for common issues; Tertiary color if a specific pain type is historically moderate.
*   **Progress Graphs:** Clean lines using the Primary color against a white/light gray plot area.

5. USER EXPERIENCE (UX) PRINCIPLES

5.1. Onboarding and Role Selection
The sign-in/sign-up process must clearly delineate roles (Player, Physician, Coach). The selection mechanism should be visually distinct and require clear confirmation.

5.2. Player Dashboard Focus
The player dashboard is centered around immediate action and historical context:
*   **Prompt First:** The diagnostic follow-up prompt (or initial "Tell me how you feel.") must be the most prominent element upon login.
*   **Visual Feedback:** Streak tracking and overall summary metrics must be immediately visible.

5.3. Physician Experience
Focus on efficient list scanning and data comparison. The primary view should be a list of players. Tapping a player leads to a clean, timeline-based view of their logs, clearly showing the associated AI guidance. Real-time messaging indicators must use a subtle Primary or Danger color dot next to the player's name when a new message is received.

5.4. Coach Experience
The Coach Dashboard must prioritize the color-coded health indicators for rapid status assessment across the roster. Color coding is paramount; text summaries should be secondary/tooltip based.

5.5. Gemini AI Output Presentation
The structured, step-by-step recovery plan returned by Gemini must be presented clearly using ordered/unordered lists, strong typographical hierarchy (H3s for Mobility vs. Nutrition), and easy-to-read formatting. Avoid dense blocks of text.

5.6. Performance Aesthetics
Any loading indicators (spinners) must be minimal, fast, and utilize the Primary color palette to maintain the professional feel during data fetching.
