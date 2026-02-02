import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/models/course.dart';
import 'package:passion_academia/core/providers/course_provider.dart';
import 'package:passion_academia/widgets/infinity_loader.dart';
import 'package:passion_academia/screens/course/chapters_screen.dart';
import 'package:passion_academia/widgets/subject_card.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';

class CourseDetailScreen extends StatefulWidget {
  final Course course;

  const CourseDetailScreen({super.key, required this.course});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  bool _isInitialLoading = true;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      context.read<CourseProvider>().fetchSubjectsForCourse(widget.course.slug);
      await Future.delayed(const Duration(milliseconds: 1500));
      if (mounted) {
        setState(() {
          _isInitialLoading = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final courseProvider = context.watch<CourseProvider>();
    final subjects = courseProvider.getSubjectsForCourse(widget.course.slug);

    if (_isInitialLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF010001),
        body: Center(child: InfinityLoader(message: 'Loading Course...')),
      );
    }

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
                  // Header section
                  _buildHeader(context),
                  const SizedBox(height: 32),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            if (subjects.isNotEmpty) {
                              // Navigate to Chapters view of the first subject
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ChaptersScreen(
                                    courseSlug: widget.course.slug,
                                    subjectTitle: subjects.first.title,
                                  ),
                                ),
                              );
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('Curriculum is loading...')),
                              );
                            }
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
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Course bookmarked!')),
                            );
                          },
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

                  subjects.isEmpty && courseProvider.isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : subjects.isEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(40.0),
                                child: Column(
                                  children: [
                                    Icon(Icons.auto_stories_outlined,
                                        size: 48,
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary
                                            .withOpacity(0.3)),
                                    const SizedBox(height: 16),
                                    const Text(
                                        'No subjects/tests available for this course yet.',
                                        textAlign: TextAlign.center),
                                  ],
                                ),
                              ),
                            )
                          : GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.8,
                                mainAxisSpacing: 16,
                                crossAxisSpacing: 16,
                              ),
                              itemCount: subjects.length,
                              itemBuilder: (context, index) {
                                final subject = subjects[index];
                                final auth = context.watch<AuthProvider>();

                                // Trigger background fetch for chapters to calculate progress accurately
                                // fetchChaptersForSubject is already optimized with a cache check
                                courseProvider.fetchChaptersForSubject(
                                    widget.course.slug, subject.title);

                                final progress =
                                    courseProvider.getSubjectProgress(
                                  widget.course.slug,
                                  subject.title,
                                  auth.completedChapters,
                                );

                                return SubjectCard(
                                  subject: subject,
                                  progress: progress,
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => ChaptersScreen(
                                          subjectTitle: subject.title,
                                          courseSlug: widget.course.slug,
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
    final bool isAsset = widget.course.imageUrl.startsWith('assets/');
    return SliverAppBar(
      expandedHeight: 240,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            isAsset
                ? Image.asset(widget.course.imageUrl, fit: BoxFit.cover)
                : Image.network(
                    widget.course.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: Colors.grey[200],
                      child: const Icon(Icons.broken_image,
                          size: 60, color: Colors.grey),
                    ),
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
    final course = widget.course;
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
