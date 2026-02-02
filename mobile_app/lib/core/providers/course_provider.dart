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
      // Fallback to mock data if fetch fails
      _courses = _mockCourses;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchSubjectsForCourse(String courseSlug) async {
    if (_courseSubjects.containsKey(courseSlug)) return;

    try {
      debugPrint('Fetching subjects for $courseSlug...');
      // 1. Fetch from 'subjects' table
      final subjectData = await _supabase
          .from('subjects')
          .select('*')
          .eq('course_type', courseSlug);

      // 2. Fetch from 'mcqs' table to find subjects that might not be in subjects table
      final mcqData = await _supabase
          .from('mcqs')
          .select('subject')
          .eq('course_type', courseSlug);

      final Set<String> uniqueSubjectNames = {};
      final List<Subject> subjects = [];

      // Add from subjects table
      for (var s in subjectData as List) {
        final name = s['subject_name'] as String;
        if (!uniqueSubjectNames.contains(name.toLowerCase())) {
          uniqueSubjectNames.add(name.toLowerCase());

          final chapterCount =
              await _getChapterCountForSubject(courseSlug, name);

          subjects.add(Subject(
            id: s['id'].toString(),
            title: name,
            icon: _getIconForSubject(name),
            chapterCount: chapterCount,
          ));
        }
      }

      // Add remaining from mcqs table
      for (var m in mcqData as List) {
        final name = m['subject'] as String;
        if (!uniqueSubjectNames.contains(name.toLowerCase())) {
          uniqueSubjectNames.add(name.toLowerCase());

          final chapterCount =
              await _getChapterCountForSubject(courseSlug, name);

          subjects.add(Subject(
            id: name,
            title: name,
            icon: _getIconForSubject(name),
            chapterCount: chapterCount,
          ));
        }
      }

      _courseSubjects[courseSlug] = subjects;
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching subjects for $courseSlug: $e');
    }
  }

  Future<int> _getChapterCountForSubject(
      String courseSlug, String subjectName) async {
    try {
      final res1 = await _supabase
          .from('chapters')
          .select('chapter_name')
          .ilike('course_type', courseSlug)
          .ilike('subject', subjectName);
      final res2 = await _supabase
          .from('mcqs')
          .select('chapter')
          .ilike('course_type', courseSlug)
          .ilike('subject', subjectName);

      final Set<String> chapters = {};
      for (var r in res1)
        chapters.add((r['chapter_name'] as String).toLowerCase());
      for (var r in res2) {
        if (r['chapter'] != null)
          chapters.add((r['chapter'] as String).toLowerCase());
      }

      return chapters.length;
    } catch (e) {
      return 0;
    }
  }

  Future<void> fetchChaptersForSubject(
      String courseSlug, String subject) async {
    final cacheKey = '${courseSlug}_$subject';
    if (_subjectChapters.containsKey(cacheKey)) return;

    try {
      debugPrint('Fetching chapters for $courseSlug - $subject...');

      // 1. Fetch from 'chapters' table
      final chapterData = await _supabase
          .from('chapters')
          .select('chapter_name')
          .ilike('course_type', courseSlug)
          .ilike('subject', subject);

      // 2. Fetch from 'mcqs' table
      final mcqData = await _supabase
          .from('mcqs')
          .select('chapter')
          .ilike('course_type', courseSlug)
          .ilike('subject', subject);

      final Set<String> uniqueChapters = {};
      final List<String> chapters = [];

      // Add from chapters table
      for (var c in chapterData as List) {
        final name = c['chapter_name'] as String;
        if (!uniqueChapters.contains(name.toLowerCase())) {
          uniqueChapters.add(name.toLowerCase());
          chapters.add(name);
        }
      }

      // Add from mcqs table
      for (var m in mcqData as List) {
        final name = (m['chapter'] ?? 'Uncategorized') as String;
        if (!uniqueChapters.contains(name.toLowerCase())) {
          uniqueChapters.add(name.toLowerCase());
          chapters.add(name);
        }
      }

      _subjectChapters[cacheKey] = chapters..sort();
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching chapters: $e');
    }
  }

  String _getIconForSubject(String name) {
    final n = name.toLowerCase();
    if (n.contains('math')) return '📐';
    if (n.contains('english')) return '📚';
    if (n.contains('urdu')) return '✍️';
    if (n.contains('physics')) return '⚡';
    if (n.contains('chemistry')) return '🧪';
    if (n.contains('biology')) return '🧬';
    if (n.contains('gk') || n.contains('general')) return '🌍';
    if (n.contains('islam')) return '☪️';
    return '📖';
  }

  final List<Course> _mockCourses = [
    Course(
      id: '6',
      title: 'Class 6 Preparation',
      slug: 'class-6',
      description:
          'Comprehensive learning materials for 6th grade students covering all core subjects.',
      imageUrl: 'assets/images/class-6.png',
      category: 'Academics',
      subjectCount: 7,
      videoCount: 85,
      students: 3200,
    ),
    Course(
      id: '1',
      title: '9th Class Preparation',
      slug: 'class-9',
      description:
          'Complete syllabus coverage for 9th class students with expert guidance and mock tests.',
      imageUrl: 'assets/images/class-9.png',
      category: 'Academics',
      subjectCount: 8,
      videoCount: 120,
      students: 5400,
    ),
    Course(
      id: 'afns',
      title: 'AFNS Nursing Prep',
      slug: 'afns-prep',
      description: 'Prepare for Armed Forces Nursing Service exams.',
      imageUrl: 'assets/images/afns-prep.png',
      category: 'Entrance',
      subjectCount: 5,
      videoCount: 60,
      students: 1500,
    ),
    Course(
      id: '2',
      title: 'PAF Cadet College Prep',
      slug: 'paf-cadet',
      description:
          'Prepare for PAF Cadet College admission with strategic guidance.',
      imageUrl: 'assets/images/paf-prep.png',
      category: 'Entrance',
      subjectCount: 6,
      videoCount: 95,
      students: 2100,
    ),
    Course(
      id: '3',
      title: 'English Grammar Masterclass',
      slug: 'english-grammar',
      description: 'Master English grammar for all competitive examinations.',
      imageUrl:
          'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
      category: 'Languages',
      subjectCount: 4,
      videoCount: 50,
      students: 4200,
    ),
  ];

  List<Course> getBySearch(String query) {
    if (query.isEmpty) return _courses;
    return _courses
        .where((c) => c.title.toLowerCase().contains(query.toLowerCase()))
        .toList();
  }

  List<Course> getByCategory(String category) {
    if (category == 'All') return _courses;
    return _courses.where((c) => c.category == category).toList();
  }
}
