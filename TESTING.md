# Testing Strategy - Passion Academia

## 🚀 Overview
Our goal is to ensure a bug-free, premium experience for every student. We follow a 3-tier testing pyramid:
1. **Unit Tests** (70%): Logic in Providers and Services.
2. **Widget Tests** (20%): Component rendering and interactions.
3. **Integration Tests** (10%): Full user flows (Login -> Study -> Quiz).

## 🧪 Unit Testing
Focus on business logic without UI.
- **AuthProvider**: Test level calculation, XP updates, and auth state flows.
- **CourseProvider**: Test course filtering and AI recommendation logic.
- **QuizProvider**: Test timer logic and score calculation.

### Example Command:
```bash
flutter test test/unit/auth_provider_test.dart
```

## 🖼 Widget Testing
Ensure UI components look and behave as expected across different screen sizes.
- **StatCard**: Verify color and icon rendering.
- **CourseCard**: Verify tap callback and data display.
- **AppHeader**: Ensure profile picture displays correctly when authenticated.

## 🔗 Integration Testing
End-to-end tests running on real devices/simulators.
- **Login Flow**: Welcome -> Signup -> Home.
- **Study Flow**: Home -> Course -> Video -> Mark Complete.
- **Quiz Flow**: Test Tab -> Daily Quiz -> Submit -> Result.

## 🛠 Quality Checklist
- [ ] No hardcoded strings (use localizations if possible).
- [ ] Error boundaries on all network calls.
- [ ] Placeholder/Loading states for all async data.
- [ ] Responsive layouts for small phones and tablets.
