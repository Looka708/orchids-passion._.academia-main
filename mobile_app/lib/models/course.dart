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
    final slug = map['slug'] ?? '';
    final name = map['name'] ?? '';

    String imageUrl = map['image_url'] ??
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600';

    // Auto-detect premium courses and use local assets
    String lowName = name.toLowerCase();
    String lowSlug = slug.toLowerCase();

    if (lowSlug.contains('afns') || lowName.contains('afns')) {
      imageUrl = 'assets/images/afns-prep.png';
    } else if (lowSlug.contains('paf') || lowName.contains('paf')) {
      imageUrl = 'assets/images/paf-prep.png';
    } else if (lowSlug.contains('mcj') || lowName.contains('mcj')) {
      imageUrl = 'assets/images/mcj-prep.png';
    } else if (lowSlug.contains('mcm') || lowName.contains('mcm')) {
      imageUrl = 'assets/images/mcm-prep.png';
    } else if (lowName.contains('class') || lowSlug.startsWith('class-')) {
      // Extract number
      final match =
          RegExp(r'\d+').firstMatch(name) ?? RegExp(r'\d+').firstMatch(slug);
      if (match != null) {
        imageUrl = 'assets/images/class-${match.group(0)}.png';
      }
    }

    return Course(
      id: map['id']?.toString() ?? '',
      title: name,
      slug: slug,
      description: map['description'] ?? '',
      imageUrl: imageUrl,
      category: map['category'] ?? 'Academics',
      subjectCount: 8,
      videoCount: 120,
      rating: 4.8,
      students: 2000,
    );
  }
}

class Subject {
  final String id;
  final String title;
  final String icon;
  final int chapterCount;

  const Subject({
    required this.id,
    required this.title,
    required this.icon,
    this.chapterCount = 0,
  });
}

class Chapter {
  final String id;
  final String title;
  final String? description;
  final String? duration;
  final String? videoUrl;
  final bool isLocked;
  final bool isCompleted;

  const Chapter({
    required this.id,
    required this.title,
    this.description,
    this.duration,
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
