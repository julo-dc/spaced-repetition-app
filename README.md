# Spaced Repetition App

A cross-platform (Web & Mobile) educational app - "Gym for the Brain" focused on Math (Calculus MVP).

## Tech Stack

- **Frontend:** Flutter (Dart)
- **Backend/Database:** Supabase (PostgreSQL)
- **State Management:** Riverpod
- **Math Rendering:** flutter_tex

## Project Structure

```
lib/
├── core/
│   └── supabase_config.dart       # Supabase initialization
├── models/
│   ├── topic.dart                 # Topic data model
│   ├── question.dart              # Question data model
│   ├── user_topic_state.dart      # User progress tracking
│   └── review.dart                # Review log model
└── main.dart                      # App entry point

supabase/
└── migrations/
    └── 20260107_initial_schema.sql # Database schema
```

## Setup Instructions

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Add your Supabase URL and Anon Key to `.env`

### 3. Run Database Migrations

In your Supabase project dashboard:
1. Go to the SQL Editor
2. Copy and paste the contents of `supabase/migrations/20260107_initial_schema.sql`
3. Execute the migration

### 4. Run the App

```bash
flutter run
```

## Database Schema

### Tables

- **topics**: Knowledge graph of subjects (e.g., Calculus → Chain Rule)
- **questions**: Global pool of MCQs with LaTeX content
- **user_topic_state**: Per-user mastery scores and review schedules
- **reviews**: Logs of all user question attempts

## Key Features (Planned)

- Spaced repetition algorithm to optimize learning
- LaTeX math rendering for equations
- Topic-based learning progression
- Performance analytics and mastery tracking

## Phase 1 Status ✅

- [x] Database schema created
- [x] Dart data models with JSON serialization
- [x] Supabase configuration
- [x] Project dependencies configured
