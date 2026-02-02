import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';
import 'package:passion_academia/screens/quiz/quiz_screen.dart';
import 'package:passion_academia/screens/course/video_lesson_screen.dart';
import 'package:passion_academia/widgets/subject_card.dart';

class CourseDetailScreen extends StatelessWidget {
  final Course course;

  const CourseDetailScreen({super.key, required this.course});

  // Mock subjects data
  static const List<Subject> _subjects = [
    Subject(id: 's1', title: 'Biology', icon: '🧬', lessonCount: 12),
    Subject(id: 's2', title: 'Physics', icon: '⚡', lessonCount: 15),
    Subject(id: 's3', title: 'Chemistry', icon: '🧪', lessonCount: 10),
    Subject(id: 's4', title: 'Mathematics', icon: '📐', lessonCount: 20),
    Subject(id: 's5', title: 'English', icon: '📚', lessonCount: 8),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(context),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hero/Description
                  _buildHeader(context),
                  const SizedBox(height: 32),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => VideoLessonScreen(
                                  course: course,
                                  initialChapter: const Chapter(
                                      id: '1',
                                      title: 'Introduction to the Course'),
                                ),
                              ),
                            );
                          },
                          icon: const Icon(Icons.play_circle_fill, size: 20),
                          label: const Text('Watch Lessons'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context)
                              .colorScheme
                              .primary
                              .withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: IconButton(
                          onPressed: () {},
                          icon: const Icon(Icons.bookmark_border),
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 48),

                  Text(
                    'Curriculum',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Focus on these key subjects to excel in your preparation.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),

                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.8,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                    ),
                    itemCount: _subjects.length,
                    itemBuilder: (context, index) {
                      final subject = _subjects[index];
                      return SubjectCard(
                        subject: subject,
                        progress: 0.2 * (index + 1),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => QuizScreen(
                                subjectTitle: subject.title,
                                courseSlug: course.slug,
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 240,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              course.imageUrl,
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.3),
                    Colors.transparent,
                    Theme.of(context).scaffoldBackgroundColor,
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            course.category.toUpperCase(),
            style: TextStyle(
              color: Theme.of(context).colorScheme.primary,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          course.title,
          style: Theme.of(context)
              .textTheme
              .headlineSmall
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Icon(Icons.people_outline,
                size: 16, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 4),
            Text('${course.students} Enrolled',
                style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(width: 16),
            const Icon(Icons.star, size: 16, color: Colors.amber),
            const SizedBox(width: 4),
            Text('${course.rating}',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(width: 16),
            Icon(Icons.video_library_outlined,
                size: 16, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 4),
            Text('${course.videoCount} Videos',
                style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
        const SizedBox(height: 24),
        Text(
          course.description.isNotEmpty
              ? course.description
              : 'Unlock your potential with our comprehensive preparation programs designed to help you achieve excellence in your academic journey.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
        ),
      ],
    );
  }
}
