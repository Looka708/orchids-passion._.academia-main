import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

class CourseProvider extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  List<Course> _courses = [];
  Map<String, List<Subject>> _courseSubjects = {}; // Cache subjects per course
  Map<String, List<String>> _subjectChapters =
      {}; // Cache chapters per subject (Key: "course_subject")
  bool _isLoading = false;

  bool get isLoading => _isLoading;
  List<Course> get courses => _courses;

  List<Subject> getSubjectsForCourse(String courseSlug) =>
      _courseSubjects[courseSlug] ?? [];

  List<String> getChaptersForSubject(String courseSlug, String subject) =>
      _subjectChapters['${courseSlug}_$subject'] ?? [];

  List<Course> get featuredCourses => _courses
      .where((c) => c.category == 'Entrance' || c.category == 'special')
      .toList();

  CourseProvider() {
    fetchCourses();
  }

  Future<void> fetchCourses() async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _supabase
          .from('classes')
          .select('*')
          .order('display_order', ascending: true);

      _courses = (data as List).map((json) => Course.fromMap(json)).toList();
    } catch (e) {
      debugPrint('Error fetching courses: $e');
      // No fallback to mock data, let the UI handle empty list or show error
      _courses = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchSubjectsForCourse(String courseSlug) async {
    if (_courseSubjects.containsKey(courseSlug)) return;

    try {
      debugPrint('Fetching subjects for $courseSlug...');

      // 1. Fetch all unique subjects for this course from both tables
      final subjectMeta = await _supabase
          .from('subjects')
          .select('*')
          .ilike('course_type', courseSlug);

      final mcqMeta = await _supabase
          .from('mcqs')
          .select('subject, chapter')
          .ilike('course_type', courseSlug);

      final chapterMeta = await _supabase
          .from('chapters')
          .select('subject, chapter_name')
          .ilike('course_type', courseSlug);

      final Map<String, Set<String>> subjectChapters = {};

      // Process 'chapters' table
      for (var c in chapterMeta as List) {
        final sub = (c['subject'] as String).toLowerCase();
        final chap = (c['chapter_name'] as String).toLowerCase();
        subjectChapters.putIfAbsent(sub, () => {}).add(chap);
      }

      // Process 'mcqs' table
      for (var m in mcqMeta as List) {
        final sub = (m['subject'] as String).toLowerCase();
        final chap = (m['chapter'] ?? 'Uncategorized').toString().toLowerCase();
        subjectChapters.putIfAbsent(sub, () => {}).add(chap);
      }

      final Set<String> uniqueSubjectNames = {};
      final List<Subject> subjects = [];

      // Add from subjects metadata table
      for (var s in subjectMeta as List) {
        final name = s['subject_name'] as String;
        final nameLower = name.toLowerCase();
        if (!uniqueSubjectNames.contains(nameLower)) {
          uniqueSubjectNames.add(nameLower);

          subjects.add(Subject(
            id: s['id'].toString(),
            title: name,
            icon: _getIconForSubject(name),
            chapterCount: subjectChapters[nameLower]?.length ?? 0,
          ));
        }
      }

      // Add remaining subjects found only in MCQs/Chapters
      subjectChapters.forEach((subNameLower, chapters) {
        if (!uniqueSubjectNames.contains(subNameLower)) {
          uniqueSubjectNames.add(subNameLower);

          // Try to capitalize first letter
          final displayTitle = subNameLower
              .split(' ')
              .map((word) => word.isNotEmpty
                  ? '${word[0].toUpperCase()}${word.substring(1)}'
                  : '')
              .join(' ');

          subjects.add(Subject(
            id: subNameLower,
            title: displayTitle,
            icon: _getIconForSubject(subNameLower),
            chapterCount: chapters.length,
          ));
        }
      });

      _courseSubjects[courseSlug] = subjects;
      notifyListeners();
    } catch (e, stack) {
      debugPrint('Error fetching subjects for $courseSlug: $e');
      debugPrint(stack.toString());
    }
  }

  // Remove the old inefficient helper

  Map<String, List<Chapter>> _subjectChaptersList = {};

  List<Chapter> getChaptersListForSubject(String courseSlug, String subject) =>
      _subjectChaptersList['${courseSlug}_$subject'] ?? [];

  Future<void> fetchChaptersForSubject(
      String courseSlug, String subject) async {
    final cacheKey = '${courseSlug}_$subject';
    if (_subjectChaptersList.containsKey(cacheKey)) return;

    try {
      debugPrint('Fetching chapters for $courseSlug - $subject...');

      // 1. Fetch from 'chapters' table
      final chapterData = await _supabase
          .from('chapters')
          .select('*')
          .ilike('course_type', courseSlug)
          .ilike('subject', subject);

      // 2. Fetch from 'mcqs' table (fallback for chapters not in chapters table)
      final mcqData = await _supabase
          .from('mcqs')
          .select('chapter')
          .ilike('course_type', courseSlug)
          .ilike('subject', subject);

      final Map<String, Chapter> chapterMap = {};

      // Add from chapters table
      for (var c in chapterData as List) {
        final name = c['chapter_name'] as String;
        final desc =
            c['description'] ?? _generateChapterDescription(name, subject);

        chapterMap[name.toLowerCase()] = Chapter(
          id: c['id'].toString(),
          title: name,
          description: desc,
          duration: c['duration'] ?? '15-20 mins',
          videoUrl: c['video_url'],
          isLocked: c['is_locked'] ?? false,
        );
      }

      // Add from mcqs table if not already present
      for (var m in mcqData as List) {
        final name = (m['chapter'] ?? 'Uncategorized') as String;
        if (!chapterMap.containsKey(name.toLowerCase())) {
          chapterMap[name.toLowerCase()] = Chapter(
            id: name,
            title: name,
            description: _generateChapterDescription(name, subject),
            duration: '10-15 mins',
          );
        }
      }

      final List<Chapter> chapters = chapterMap.values.toList()
        ..sort((a, b) => a.title.compareTo(b.title));

      _subjectChaptersList[cacheKey] = chapters;
      _subjectChapters[cacheKey] = chapters
          .map((c) => c.title)
          .toList(); // Keep old cache for compatibility
      notifyListeners();
    } catch (e, stack) {
      debugPrint('Error fetching chapters: $e');
      debugPrint(stack.toString());
    }
  }

  double getSubjectProgress(
      String courseSlug, String subjectTitle, List<String> completedEntries) {
    final chapters = getChaptersListForSubject(courseSlug, subjectTitle);
    if (chapters.isEmpty) return 0.0;

    int completedCount = 0;
    for (var chapter in chapters) {
      final entry = '${courseSlug}_${chapter.id}';
      if (completedEntries.contains(entry)) {
        completedCount++;
      }
    }

    return completedCount / chapters.length;
  }

  String _getIconForSubject(String name) {
    final n = name.toLowerCase();
    if (n.contains('math')) return '📐';
    if (n.contains('english')) return '📚';
    if (n.contains('urdu')) return '✍️';
    if (n.contains('physics')) return '⚡';
    if (n.contains('chemistry')) return '🧪';
    if (n.contains('biol')) return '🧬';
    if (n.contains('gk') || n.contains('general knowledge')) return '🌍';
    if (n.contains('islam')) return '☪️';
    if (n.contains('intelligence')) return '🧠';
    if (n.contains('verbal')) return '🗣️';
    if (n.contains('non-verbal')) return '🧩';
    if (n.contains('pakistan study')) return '🇵🇰';
    if (n.contains('computer')) return '💻';
    return '📖';
  }

  String _generateChapterDescription(String chapter, String subject) {
    final c = chapter.toLowerCase();
    final s = subject.toLowerCase();

    if (c.contains('intro'))
      return 'Comprehensive introduction to the core concepts of $subject.';
    if (c.contains('advance'))
      return 'In-depth exploration of advanced topics and complex problem-solving in $subject.';
    if (c.contains('test') || c.contains('quiz'))
      return 'Strategic preparation and practice session for excelling in $subject exams.';
    if (c.contains('exercise'))
      return 'Practical exercises and real-world applications of the theories learned in $subject.';

    // Fallback based on subject
    if (s.contains('bio'))
      return 'Deep dive into life sciences, covering the biological mechanisms of $chapter.';
    if (s.contains('physic'))
      return 'Understanding the laws of nature and physical phenomena through the lens of $chapter.';
    if (s.contains('math'))
      return 'Mastering mathematical precision and logical reasoning focused on $chapter.';
    if (s.contains('english'))
      return 'Enhancing linguistics, grammar, and literary analysis specific to $chapter.';
    if (s.contains('intelligence'))
      return 'Analytical skill development and cognitive training exercises focused on $chapter patterns.';

    return 'Explore the essential principles of $chapter within the context of the $subject curriculum.';
  }

  List<Course> getBySearch(String query) {
    if (query.trim().isEmpty) return _courses;
    final q = query.toLowerCase().trim();

    return _courses.where((c) {
      return c.title.toLowerCase().contains(q) ||
          c.description.toLowerCase().contains(q) ||
          c.category.toLowerCase().contains(q) ||
          c.slug.toLowerCase().contains(q);
    }).toList();
  }

  List<Course> searchCourses({String? category, String? query}) {
    List<Course> results = _courses;

    if (category != null && category != 'All') {
      results = results.where((c) => c.category == category).toList();
    }

    if (query != null && query.trim().isNotEmpty) {
      final q = query.toLowerCase().trim();
      results = results.where((c) {
        return c.title.toLowerCase().contains(q) ||
            c.description.toLowerCase().contains(q) ||
            c.slug.toLowerCase().contains(q);
      }).toList();
    }

    return results;
  }

  List<Course> getRecommendations(String? targetCourse) {
    if (targetCourse == null || targetCourse == 'All') {
      return featuredCourses;
    }

    // Sort courses: target course first, then featured, then others
    final recs = List<Course>.from(_courses);
    recs.sort((a, b) {
      if (a.slug == targetCourse) return -1;
      if (b.slug == targetCourse) return 1;
      if (a.category == 'Entrance') return -1;
      if (b.category == 'Entrance') return 1;
      return 0;
    });

    return recs.take(6).toList();
  }
}
