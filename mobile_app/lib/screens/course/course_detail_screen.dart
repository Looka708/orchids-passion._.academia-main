import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';
import 'package:passion_academia/screens/quiz/quiz_screen.dart';
import 'package:passion_academia/widgets/subject_card.dart';

class CourseDetailScreen extends StatelessWidget {
  final Course course;

  const CourseDetailScreen({super.key, required this.course});

  // Mock subjects data
  static const List<Map<String, dynamic>> _mockSubjects = [
    {
      'title': 'Biology',
      'icon': Icons.biotech,
      'description': 'Core biological concepts including botany and zoology.',
    },
    {
      'title': 'Physics',
      'icon': Icons.bolt,
      'description':
          'Fundamental physics principles from mechanics to modern physics.',
    },
    {
      'title': 'Chemistry',
      'icon': Icons.science,
      'description': 'Organic, inorganic, and physical chemistry essentials.',
    },
    {
      'title': 'Mathematics',
      'icon': Icons.functions,
      'description': 'Mathematical reasoning and problem-solving techniques.',
    },
    {
      'title': 'English',
      'icon': Icons.menu_book,
      'description': 'Grammar, vocabulary, and verbal reasoning skills.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(course.title),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Theme.of(context).colorScheme.primary.withOpacity(0.1),
                      Theme.of(context).colorScheme.primary.withOpacity(0.05),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: Theme.of(context)
                          .colorScheme
                          .primary
                          .withOpacity(0.1)),
                ),
                child: Column(
                  children: [
                    Text(
                      '${course.title} Preparation',
                      textAlign: TextAlign.center,
                      style:
                          Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Expert-led preparation and comprehensive mock tests for students.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: Theme.of(context).textTheme.bodyMedium?.color),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Available Subjects',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 1,
                  childAspectRatio: 2.2,
                  mainAxisSpacing: 16,
                ),
                itemCount: _mockSubjects.length,
                itemBuilder: (context, index) {
                  final subject = _mockSubjects[index];
                  return SubjectCard(
                    title: subject['title'],
                    icon: subject['icon'],
                    description: subject['description'],
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              QuizScreen(subjectTitle: subject['title']),
                        ),
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
