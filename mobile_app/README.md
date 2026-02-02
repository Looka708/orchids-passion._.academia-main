# 📱 Passion Academia Mobile

### *Learner's Companion for Passion Academia*

Passion Academia Mobile is the high-performance Flutter-based companion for the Passion Academia platform. It provides a seamless, gamified learning experience for students preparing for Grade 6-12 exams and specialized entry tests (AFNS, PAF, etc.).

---

## ✨ Features

- **🚀 Infinity Loader**: A custom, high-end loading animation for a premium feel.
- **📚 Smart Lessons**: Dynamic course navigation with chapter-wise progress tracking.
- **🎥 YouTube Integration**: AI-powered video suggestions for every chapter using the YouTube Data API.
- **📝 Intelligent Quizzes**: Practice with MCQ tests powered by real data and AI.
- **🏆 Gamification**: Daily streaks and XP system to motivate consistent learning.
- **👮 Admin Console**: Comprehensive mobile dashboard for managing users, courses, and MCQs.

---

## 🏗️ Technical Architecture

The app uses a **Hybrid Backend Approach**:
- **Firebase**: Handles secure authentication and user profiles.
- **Supabase**: Powers the content repository (MCQs, Courses) and manages profile picture storage.
- **OpenRouter & YouTube API**: Provides AI features and video recommendations.

---

## 🛠️ Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.10+)
- [Dart SDK](https://dart.dev/get-dart)
- A physical device or emulator (Android/iOS)

### Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/Looka708/passion-academia.git
   cd passion-academia/mobile_app
   ```

2. **Install dependencies**:
   ```bash
   flutter pub get
   ```

3. **Configure API Keys**:
   The app uses the following services:
   - Firebase (via REST)
   - Supabase
   - YouTube Data API
   
   Ensure keys are correctly set in `lib/core/services/firebase_service.dart` and `lib/core/services/supabase_service.dart`.

4. **Run the app**:
   ```bash
   flutter run
   ```

---

## 📸 Project Summary

This mobile application was developed to complement the web platform, bringing identical features to the pockets of students with optimized mobile performance and offline-ready architectures.

---

**Made with ❤️ by Muhammad Umer**
