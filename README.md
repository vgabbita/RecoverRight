# RecoverRight

A daily recovery check-in platform designed for MLB players, physicians, and coaches to collaborate on proactive injury prevention and performance management.

Link to deployed website: https://recover-right-jet.vercel.app/ 

## What is RecoverRight?

RecoverRight is a web application that brings together players, medical staff, and coaching teams in one unified platform for tracking and managing athlete recovery. Using AI-powered insights, the app helps players understand their body's needs and enables medical professionals to monitor team health in real-time.

## Why It Matters

Injury prevention in professional baseball requires constant communication and data-driven decision-making. RecoverRight:
- **Prevents injuries** by identifying pain patterns early
- **Improves recovery** with personalized, AI-generated recovery plans
- **Streamlines communication** between players, physicians, and coaches
- **Centralizes health data** in one secure, professional platform
- **Accelerates response time** to emerging health issues

## Core Features

### For Players
- **Daily Check-ins**: Submit a quick daily reflection describing how your body feels
- **AI Recovery Plans**: Receive personalized guidance on mobility work, hydration, nutrition, and sleep
- **Progress Tracking**: View your recovery history with streak counts and visual progress graphs
- **Smart Prompts**: Get diagnostic follow-up questions that reference your previous logs
- **Direct Messaging**: Receive personalized advice from your physician

### For Physicians
- **Player Roster**: View all registered players and their recent health data
- **Detailed Logs**: Review full player reflections and injuries
- **Real-Time Messaging**: Send private messages and personalized guidance
- **Health Monitoring**: Track patterns across your assigned players' recovery data

### For Coaches
- **At-a-Glance Status**: See all players with color-coded health indicators
  - 🟢 **Green**: Fully healthy, ready to play
  - 🟡 **Yellow**: Caution, monitor closely
  - 🔴 **Red**: High risk, potential restriction needed
- **Quick Summaries**: Instantly understand each player's current condition
- **Team Overview**: Visualize overall team readiness and recovery trends

## How to Use RecoverRight

### Getting Started
1. **Sign Up**: Visit the app and create an account
2. **Select Your Role**: Choose whether you're a Player, Physician, or Coach
3. **Complete Your Profile**: Enter your name and age

### For Players
1. Log in to your dashboard
2. Click **"New Daily Check-in"** to submit your daily reflection
3. Describe how your body feels and select pain locations, severity, and energy levels
4. Submit to receive an AI-powered recovery plan
5. View your past logs and track your progress on your dashboard

### For Physicians
1. Log in to your dashboard
2. View your **Player Roster** to see recent activity
3. Click on a player to review their full recovery history
4. Send private messages with guidance or workout attachments
5. Monitor patterns to identify emerging health concerns

An account for the physician has already been created: 
Email: physician@gmail.com
Password: abc123

### For Coaches
1. Log in to your dashboard
2. Scan the **Player List** with color-coded health indicators
3. Click on a player for detailed recovery information
4. Use the visual indicators to understand overall player health and make game-day roster decisions
Email: coach@gmail.com 
Password: abc123

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn UI
- **Backend**: Next.js
- **Database & Auth**: Supabase
- **AI**: Google Gemini API for personalized recovery insights
- **Deployment**: Vercel

## Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/vgabbita/RecoverRight.git
cd RecoverRight

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Gemini API credentials

# Run the development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

**RecoverRight** — Empowering athletes through data-driven recovery.
