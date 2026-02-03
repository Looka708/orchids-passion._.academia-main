class UserActivityReport {
  final String userId;
  final String userName;
  final String email;
  final int totalXp;
  final int currentStreak;
  final int longestStreak;
  final int totalLogins;
  final DateTime lastActive;
  final List<DailyActivity> dailyActivity;

  UserActivityReport({
    required this.userId,
    required this.userName,
    required this.email,
    required this.totalXp,
    required this.currentStreak,
    required this.longestStreak,
    required this.totalLogins,
    required this.lastActive,
    required this.dailyActivity,
  });

  factory UserActivityReport.fromJson(Map<String, dynamic> json) {
    return UserActivityReport(
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? 'Anonymous',
      email: json['email'] ?? '',
      totalXp: json['totalXp'] ?? 0,
      currentStreak: json['currentStreak'] ?? 0,
      longestStreak: json['longestStreak'] ?? 0,
      totalLogins: json['totalLogins'] ?? 0,
      lastActive: json['lastActive'] != null
          ? DateTime.parse(json['lastActive'])
          : DateTime.now(),
      dailyActivity: (json['dailyActivity'] as List? ?? [])
          .map((e) => DailyActivity.fromJson(e))
          .toList(),
    );
  }
}

class DailyActivity {
  final DateTime date;
  final int xpEarned;
  final int questionsSolved;

  DailyActivity({
    required this.date,
    required this.xpEarned,
    required this.questionsSolved,
  });

  factory DailyActivity.fromJson(Map<String, dynamic> json) {
    return DailyActivity(
      date:
          json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
      xpEarned: json['xpEarned'] ?? 0,
      questionsSolved: json['questionsSolved'] ?? 0,
    );
  }
}

class QuizPerformanceReport {
  final String subject;
  final int totalAttempts;
  final int uniqueAttempts;
  final double averageScore;
  final double passRate;
  final Map<String, double> scoreDistribution;
  final List<QuestionAnalysis> questionAnalysis;

  QuizPerformanceReport({
    required this.subject,
    required this.totalAttempts,
    required this.uniqueAttempts,
    required this.averageScore,
    required this.passRate,
    required this.scoreDistribution,
    required this.questionAnalysis,
  });

  factory QuizPerformanceReport.fromJson(Map<String, dynamic> json) {
    return QuizPerformanceReport(
      subject: json['subject'] ?? 'All',
      totalAttempts: json['totalAttempts'] ?? 0,
      uniqueAttempts: json['uniqueAttempts'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      passRate: (json['passRate'] ?? 0).toDouble(),
      scoreDistribution:
          Map<String, double>.from(json['scoreDistribution'] ?? {}),
      questionAnalysis: (json['questionAnalysis'] as List? ?? [])
          .map((e) => QuestionAnalysis.fromJson(e))
          .toList(),
    );
  }
}

class QuestionAnalysis {
  final String questionId;
  final String questionText;
  final int totalTimesAsked;
  final int correctAnswers;
  final double difficultyScore; // 0 to 1, where 1 is hardest

  QuestionAnalysis({
    required this.questionId,
    required this.questionText,
    required this.totalTimesAsked,
    required this.correctAnswers,
    required this.difficultyScore,
  });

  factory QuestionAnalysis.fromJson(Map<String, dynamic> json) {
    return QuestionAnalysis(
      questionId: json['questionId'] ?? '',
      questionText: json['questionText'] ?? '',
      totalTimesAsked: json['totalTimesAsked'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      difficultyScore: (json['difficultyScore'] ?? 0).toDouble(),
    );
  }
}

class CourseEngagementReport {
  final String courseId;
  final String courseTitle;
  final int totalEnrollments;
  final int activeStudents;
  final double completionRate;
  final double averageProgress;
  final List<EnrollmentTrend> enrollmentTrends;

  CourseEngagementReport({
    required this.courseId,
    required this.courseTitle,
    required this.totalEnrollments,
    required this.activeStudents,
    required this.completionRate,
    required this.averageProgress,
    required this.enrollmentTrends,
  });

  factory CourseEngagementReport.fromJson(Map<String, dynamic> json) {
    return CourseEngagementReport(
      courseId: json['courseId'] ?? '',
      courseTitle: json['courseTitle'] ?? '',
      totalEnrollments: json['totalEnrollments'] ?? 0,
      activeStudents: json['activeStudents'] ?? 0,
      completionRate: (json['completionRate'] ?? 0).toDouble(),
      averageProgress: (json['averageProgress'] ?? 0).toDouble(),
      enrollmentTrends: (json['enrollmentTrends'] as List? ?? [])
          .map((e) => EnrollmentTrend.fromJson(e))
          .toList(),
    );
  }
}

class EnrollmentTrend {
  final DateTime date;
  final int enrollmentCount;

  EnrollmentTrend({
    required this.date,
    required this.enrollmentCount,
  });

  factory EnrollmentTrend.fromJson(Map<String, dynamic> json) {
    return EnrollmentTrend(
      date:
          json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
      enrollmentCount: json['enrollmentCount'] ?? 0,
    );
  }
}
