class Course {
  final String id;
  final String title;
  final String slug;
  final String description;
  final String imageUrl;
  final String category;
  final int subjectCount;
  final int videoCount;
  final double rating;
  final int students;

  const Course({
    required this.id,
    required this.title,
    required this.slug,
    this.description = '',
    required this.imageUrl,
    this.category = 'Featured',
    required this.subjectCount,
    this.videoCount = 0,
    this.rating = 4.8,
    this.students = 0,
  });

  factory Course.fromMap(Map<String, dynamic> map) {
    return Course(
      id: map['id'].toString(),
      title: map['name'] ?? '',
      slug: map['slug'] ?? '',
      description: map['description'] ?? '',
      imageUrl: map['image_url'] ??
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
      category: map['category'] ?? 'Academics',
      subjectCount: 8, // Placeholder or fetch from related table
      videoCount: 120, // Placeholder
      rating: 4.8,
      students: 2000,
    );
  }
}

class Subject {
  final String id;
  final String title;
  final String icon;
  final int lessonCount;

  const Subject({
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

  const Chapter({
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

  const Question({
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

  const Testimonial({
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

  const UserStats({
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

  const Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    this.isUnlocked = false,
  });
}
