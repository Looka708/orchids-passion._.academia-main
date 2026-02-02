import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';

class CourseProvider extends ChangeNotifier {
  final List<Course> _courses = [
    Course(
      id: '1',
      title: '9th Class Preparation',
      description:
          'Complete syllabus coverage for 9th class students with expert guidance and mock tests.',
      imageUrl:
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
      category: 'Academics',
      subjectCount: 8,
      videoCount: 120,
      students: 5400,
    ),
    Course(
      id: '2',
      title: 'PAF Cadet Test Prep',
      description:
          'Specialized training for PAF Cadet College admission tests covering all key subjects.',
      imageUrl:
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
      category: 'Entrance',
      subjectCount: 5,
      videoCount: 85,
      students: 2100,
    ),
    Course(
      id: '3',
      title: 'AFNS Test Preparation',
      description:
          'Prepare for Armed Forces Nursing Services entrance with our comprehensive study material.',
      imageUrl:
          'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=600',
      category: 'Nursing',
      subjectCount: 4,
      videoCount: 60,
      students: 3200,
    ),
    Course(
      id: '4',
      title: 'MCJ/MCM Entrance Prep',
      description:
          'Strategic preparation for Military College Jhelum and Murree entrance examinations.',
      imageUrl:
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      category: 'Entrance',
      subjectCount: 6,
      videoCount: 90,
      students: 1800,
    ),
    Course(
      id: '5',
      title: 'English Language Masterclass',
      description:
          'Master English grammar, vocabulary, and communication skills for competitive exams.',
      imageUrl:
          'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600',
      category: 'Languages',
      subjectCount: 3,
      videoCount: 45,
      students: 4100,
    ),
    Course(
      id: '6',
      title: 'General Knowledge & Current Affairs',
      description:
          'Stay updated with global events and improve your general knowledge for all entrance tests.',
      imageUrl:
          'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600',
      category: 'Academics',
      subjectCount: 2,
      videoCount: 30,
      students: 6200,
    ),
    Course(
      id: '7',
      title: 'ISSB Interview Preparation',
      description:
          'Comprehensive guide and psychological preparation for the ISSB selection process.',
      imageUrl:
          'https://images.unsplash.com/photo-1544652478-665caee0df7a?auto=format&fit=crop&q=80&w=600',
      category: 'Entrance',
      subjectCount: 1,
      videoCount: 25,
      students: 1500,
    ),
  ];

  List<Course> get courses => _courses;
  List<Course> get featuredCourses =>
      _courses.where((c) => c.category == 'Entrance' || c.id == '1').toList();

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
