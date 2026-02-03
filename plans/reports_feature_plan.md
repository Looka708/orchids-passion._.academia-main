# Admin Panel Reports Feature Plan

## Overview
Add a comprehensive Reports section to the Admin Panel for monitoring user activity, quiz performance, and course engagement with filtering and export capabilities.

## Architecture

```
mermaid
graph TD
    A[AdminPanelScreen] --> B[ReportsScreen]
    B --> C[UserActivityReport]
    B --> D[QuizPerformanceReport]
    B --> E[CourseEngagementReport]
    
    F[AdminProvider] --> G[fetchUserActivityReport]
    F --> H[fetchQuizPerformanceReport]
    F --> I[fetchCourseEngagementReport]
    
    J[FirebaseService] --> K[aggregateUserActivities]
    J --> L[aggregateQuizResults]
    J --> M[aggregateCourseEnrollments]
```

## Data Models

### UserActivityReport
```dart
class UserActivityReport {
  String userId;
  String userName;
  String email;
  int totalXp;
  int currentStreak;
  int longestStreak;
  int totalLogins;
  DateTime lastActive;
  List<DailyActivity> dailyActivity;
}
```

### QuizPerformanceReport
```dart
class QuizPerformanceReport {
  String subject;
  int totalAttempts;
  int uniqueAttempts;
  double averageScore;
  double passRate;
  Map<String, double> scoreDistribution;
  List<QuestionAnalysis> questionAnalysis;
}
```

### CourseEngagementReport
```dart
class CourseEngagementReport {
  String courseId;
  String courseTitle;
  int totalEnrollments;
  int activeStudents;
  int completionRate;
  double averageProgress;
  List<EnrollmentTrend> enrollmentTrends;
}
```

## Implementation Steps

### Step 1: Data Models
Create `mobile_app/lib/models/report_models.dart`:
- `UserActivityReport`
- `QuizPerformanceReport`  
- `CourseEngagementReport`
- Supporting classes (`DailyActivity`, `QuestionAnalysis`, `EnrollmentTrend`)

### Step 2: Extend AdminProvider
Add to `mobile_app/lib/core/providers/admin_provider.dart`:
```dart
Future<UserActivityReport> fetchUserActivityReport({
  DateTime? startDate,
  DateTime? endDate,
  String? userId,
});

Future<QuizPerformanceReport> fetchQuizPerformanceReport({
  DateTime? startDate,
  DateTime? endDate,
  String? subject,
});

Future<CourseEngagementReport> fetchCourseEngagementReport({
  DateTime? startDate,
  DateTime? endDate,
  String? courseId,
});
```

### Step 3: Extend FirebaseService
Add to `mobile_app/lib/core/services/firebase_service.dart`:
```dart
static Future<List<Map<String, dynamic>>> aggregateUserActivities({
  DateTime? startDate,
  DateTime? endDate,
});

static Future<Map<String, dynamic>> aggregateQuizResults({
  DateTime? startDate,
  DateTime? endDate,
});

static Future<List<Map<String, dynamic>>> aggregateCourseEnrollments({
  DateTime? startDate,
  DateTime? endDate,
});
```

### Step 4: Create ReportsScreen
Create `mobile_app/lib/screens/admin/reports_screen.dart`:
- TabBar with 3 tabs: Activity, Quiz, Courses
- Date range picker at top
- Summary cards for key metrics
- Expandable detailed sections

### Step 5: User Activity Report Tab
- User leaderboard with XP sorting
- Streak statistics visualization
- Login frequency chart
- Search/filter by user

### Step 6: Quiz Performance Report Tab
- Pass rate by subject
- Score distribution chart
- Most difficult questions
- Quiz completion rates

### Step 7: Course Engagement Report Tab
- Enrollment trends over time
- Course popularity ranking
- Completion rate by course
- Active student counts

### Step 8: Date Range Filter
Add `mobile_app/lib/widgets/date_range_filter.dart`:
- Preset ranges (7 days, 30 days, 90 days, All time)
- Custom date picker
- Apply filter button

### Step 9: Export Functionality
Add export methods:
- CSV export for tabular data
- PDF export using `pdf` package (optional)
- Share functionality

### Step 10: Update AdminPanelScreen
Modify `mobile_app/lib/screens/admin/admin_panel_screen.dart`:
- Add "Reports" tab to TabBar
- Import and add `ReportsScreen()` to TabBarView

## Dependencies
Add to `pubspec.yaml`:
```yaml
# For charts (if needed)
charts_flutter: ^0.12.0

# For PDF export (optional)
pdf: ^3.10.0
printing: ^5.11.0

# For CSV export
csv: ^5.1.0
```

## UI/UX Design

### Dashboard Summary Cards
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Total Users   │ │  Active Today   │ │  Avg Quiz Score │
│      1,234      │ │      456        │ │      78.5%      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Report Tab Structure
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Reports                    [Last 30 Days ▼] [📥 Export] │
├─────────────────────────────────────────────────────────────┤
│  [Activity]  [Quiz]  [Courses]                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Key Metrics ─────────────────────────────────────────┐ │
│  │  Users Active:  456  │  New Signups:  89  │  XP Given:  │ │
│  │                     │                    │  125,000    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Activity Chart (Line/Bar) ────────────────────────────┐ │
│  │  ▁▂▃▅▆▇▆▅▃▂▁▁▂▃▅▆▇▆▅▃▂                                │ │
│  │  M  T  W  T  F  S  S  M  T  W                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Top Performers ───────────────────────────────────────┐ │
│  │  👤 Ahmed Khan      12,450 XP  🔥 45 day streak        │ │
│  │  👤 Sara Ali         11,200 XP  🔥 32 day streak        │ │
│  │  👤 Ali Raza          9,800 XP  🔥 28 day streak        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API/Backend Requirements

### Firestore Collections Needed
1. `activities` - For user activity tracking
2. `quiz_results` - For quiz performance data
3. `course_progress` - For course engagement tracking

### Supabase Tables Needed
1. `quiz_attempts` - Quiz attempt records
2. `course_enrollments` - Enrollment data
3. `lesson_progress` - Lesson completion tracking

## Testing Plan
1. Unit tests for report data aggregation
2. Widget tests for ReportsScreen
3. Integration tests for data fetching
4. Performance testing with large datasets

## Future Enhancements
- Real-time dashboard updates using streams
- Custom report builder
- Scheduled report generation
- Email report delivery
- Comparative analytics (month over month)
