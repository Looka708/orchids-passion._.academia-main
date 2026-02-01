class Course {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final String category;
  final int subjectCount;
  final int videoCount;
  final double rating;
  final int students;

  Course({
    required this.id,
    required this.title,
    this.description = '',
    required this.imageUrl,
    this.category = 'Featured',
    required this.subjectCount,
    this.videoCount = 0,
    this.rating = 4.8,
    this.students = 0,
  });
}

class Subject {
  final String id;
  final String title;
  final String icon;
  final int lessonCount;

  Subject({
    required this.id,
    required this.title,
    required this.icon,
    this.lessonCount = 0,
  });
}

class Chapter {
  final String id;
  final String title;
  final String? videoUrl;
  final bool isLocked;
  final bool isCompleted;

  Chapter({
    required this.id,
    required this.title,
    this.videoUrl,
    this.isLocked = false,
    this.isCompleted = false,
  });
}

class Question {
  final String id;
  final String text;
  final List<String> options;
  final String correctAnswer;
  final String? language;

  Question({
    required this.id,
    required this.text,
    required this.options,
    required this.correctAnswer,
    this.language,
  });
}

class Testimonial {
  final String id;
  final String name;
  final String role;
  final String quote;
  final double rating;

  Testimonial({
    required this.id,
    required this.name,
    required this.role,
    required this.quote,
    this.rating = 5.0,
  });
}

class UserStats {
  final int xp;
  final int streak;
  final int coursesEnrolled;

  UserStats({
    this.xp = 0,
    this.streak = 0,
    this.coursesEnrolled = 0,
  });
}

class Achievement {
  final String id;
  final String title;
  final String description;
  final String icon;
  final bool isUnlocked;

  Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    this.isUnlocked = false,
  });
}
