import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

class CourseProvider extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  List<Course> _courses = [];
  bool _isLoading = false;

  bool get isLoading => _isLoading;
  List<Course> get courses => _courses;

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

  final List<Course> _mockCourses = [
    Course(
      id: '1',
      title: '9th Class Preparation',
      slug: 'class-9',
      description:
          'Complete syllabus coverage for 9th class students with expert guidance and mock tests.',
      imageUrl:
          'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600',
      category: 'Academics',
      subjectCount: 8,
      videoCount: 120,
      students: 5400,
    ),
    Course(
      id: '2',
      title: 'PAF Cadet College Prep',
      slug: 'paf-cadet',
      description:
          'Prepare for PAF Cadet College admission with strategic guidance.',
      imageUrl:
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
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
