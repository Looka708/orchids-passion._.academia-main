import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';

class VideoLessonScreen extends StatefulWidget {
  final Course course;
  final Chapter initialChapter;

  const VideoLessonScreen({
    super.key,
    required this.course,
    required this.initialChapter,
  });

  @override
  State<VideoLessonScreen> createState() => _VideoLessonScreenState();
}

class _VideoLessonScreenState extends State<VideoLessonScreen> {
  late Chapter _activeChapter;

  final List<Chapter> _chapters = [
    const Chapter(
        id: '1', title: 'Introduction to the Course', isCompleted: true),
    const Chapter(id: '2', title: 'Fundamental Concepts', isCompleted: true),
    const Chapter(id: '3', title: 'Detailed Analysis & Examples'),
    const Chapter(id: '4', title: 'Advanced Problem Solving', isLocked: true),
    const Chapter(id: '5', title: 'Practical Applications', isLocked: true),
    const Chapter(id: '6', title: 'Final Review & Summary', isLocked: true),
  ];

  @override
  void initState() {
    super.initState();
    _activeChapter = widget.initialChapter;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Video Player Mock
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Container(
                    color: Colors.black,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.play_circle_fill,
                              size: 60, color: Colors.white),
                          const SizedBox(height: 12),
                          Text(
                            _activeChapter.title,
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
              ],
            ),

            // Lesson Info
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _activeChapter.title,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleLarge
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              widget.course.title,
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.favorite_border),
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      _buildInfoChip(Icons.video_library_outlined, '12 mins'),
                      const SizedBox(width: 12),
                      _buildInfoChip(Icons.description_outlined, 'Materials'),
                      const SizedBox(width: 12),
                      _buildInfoChip(Icons.quiz_outlined, 'Quiz Available'),
                    ],
                  ),
                ],
              ),
            ),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.0),
              child: Divider(),
            ),

            // Playlist Header
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Course Content',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('${_chapters.length} Lessons',
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),

            // Playlist
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: _chapters.length,
                itemBuilder: (context, index) {
                  final chapter = _chapters[index];
                  final isActive = _activeChapter.id == chapter.id;

                  return ListTile(
                    onTap: chapter.isLocked
                        ? null
                        : () {
                            setState(() {
                              _activeChapter = chapter;
                            });
                          },
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: isActive
                            ? Theme.of(context)
                                .colorScheme
                                .primary
                                .withOpacity(0.1)
                            : (chapter.isLocked
                                ? Colors.grey.withOpacity(0.1)
                                : Theme.of(context)
                                    .colorScheme
                                    .secondary
                                    .withOpacity(0.2)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        chapter.isLocked
                            ? Icons.lock
                            : (isActive
                                ? Icons.play_arrow
                                : Icons.play_arrow_outlined),
                        size: 20,
                        color: chapter.isLocked
                            ? Colors.grey
                            : (isActive
                                ? Theme.of(context).colorScheme.primary
                                : null),
                      ),
                    ),
                    title: Text(
                      chapter.title,
                      style: TextStyle(
                        fontWeight:
                            isActive ? FontWeight.bold : FontWeight.normal,
                        color: chapter.isLocked ? Colors.grey : null,
                      ),
                    ),
                    subtitle: Text(
                      'Lesson ${index + 1} • 10-15 mins',
                      style: const TextStyle(fontSize: 12),
                    ),
                    trailing: chapter.isCompleted
                        ? const Icon(Icons.check_circle,
                            color: Colors.green, size: 20)
                        : (isActive
                            ? const Icon(Icons.bar_chart,
                                color: Colors.blue, size: 20)
                            : null),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}
