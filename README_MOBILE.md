# Passion Academia - Mobile App Documentation

## 🚀 Overview
A premium educational mobile application designed for entry test preparation (AFNS, PAF, MCJ, MCM) and academic excellence (Grades 6-12). Built with Flutter, it features a hybrid backend (Firebase + Supabase) for maximum scalability and real-time engagement.

## 🛠 Technology Stack
- **Framework**: Flutter (Dart)
- **State Management**: Provider
- **Authentication**: Firebase Auth (REST API)
- **Database (User Data)**: Cloud Firestore (REST API)
- **Database (Academic Content)**: Supabase
- **Storage**: Firebase Storage & Supabase Storage
- **Gamification**: Custom RPG-style Leveling & Streak System

## 📂 Architecture
The project follows a modular structure:
- `lib/core/providers`: State management logic.
- `lib/core/services`: API interaction layers (Firebase/Supabase).
- `lib/screens`: UI screens grouped by feature (Auth, Course, Profile, Admin).
- `lib/widgets`: Reusable UI components.
- `lib/models`: Data models with JSON serialization.

## 🎮 Gamification System
- **XP**: Earned by watching lessons (20 XP) and completing quizzes (50 XP).
- **Levels**: Calculated as `(XP / 500) + 1`.
- **Streaks**: Incremented daily on quiz completion.
- **Leaderboards**: Real-time streak-based rankings.

## 🤖 AI Recommendations
The app uses a discovery engine that prioritizes content based on:
1. User's target career (e.g., "AFNS").
2. Featured entry test courses.
3. Category-based exploration.

## 🔑 Admin Tools
Admins can access the dashboard to:
- Monitor total users and MCQs.
- Toggle student account status (Active/Inactive).
- Inspect detailed user profiles (XP, Streaks, Course selections).
- Manage MCQs and course content.

---
*Developed by the Passion Academia Team.*
