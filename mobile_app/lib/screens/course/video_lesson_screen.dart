import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';
import 'package:passion_academia/core/services/youtube_service.dart';
import 'package:url_launcher/url_launcher.dart';

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
  List<Map<String, dynamic>> _suggestedVideos = [];
  bool _isLoadingVideos = false;
  Map<String, dynamic>? _currentPlayingVideo;

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
    _fetchVideos();
  }

  Future<void> _fetchVideos() async {
    setState(() {
      _isLoadingVideos = true;
      _suggestedVideos = [];
      _currentPlayingVideo = null;
    });

    final query = '${widget.course.title} ${_activeChapter.title}';
    final videos = await YoutubeService.searchVideos(query);

    if (mounted) {
      setState(() {
        _suggestedVideos = videos;
        if (videos.isNotEmpty) {
          _currentPlayingVideo = videos.first;
        }
        _isLoadingVideos = false;
      });
    }
  }

  Future<void> _launchYoutubeVideo(String videoId) async {
    final uri = Uri.parse('https://www.youtube.com/watch?v=$videoId');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Video Player Area
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Stack(
                children: [
                  Container(
                    color: Colors.black,
                    child: _currentPlayingVideo != null
                        ? Image.network(
                            _currentPlayingVideo!['thumbnail'],
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Center(
                                child: Icon(Icons.error, color: Colors.white)),
                          )
                        : const Center(
                            child: Icon(Icons.play_circle_fill,
                                size: 60, color: Colors.white)),
                  ),
                  Container(
                    color: Colors.black.withOpacity(0.4),
                  ),
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.play_circle_fill,
                              size: 60, color: Colors.white),
                          onPressed: () {
                            if (_currentPlayingVideo != null) {
                              _launchYoutubeVideo(
                                  _currentPlayingVideo!['videoId']);
                            }
                          },
                        ),
                        const SizedBox(height: 12),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          child: Text(
                            _currentPlayingVideo?['title'] ??
                                _activeChapter.title,
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16),
                          ),
                        ),
                      ],
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
            ),

            // Tabs / Recommendations
            Expanded(
              child: ListView(
                children: [
                  // Lesson Info
                  Padding(
                    padding: const EdgeInsets.all(20.0),
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
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            _buildInfoChip(
                                Icons.video_library_outlined, '12 mins'),
                            const SizedBox(width: 12),
                            _buildInfoChip(
                                Icons.description_outlined, 'Materials'),
                            const SizedBox(width: 12),
                            _buildInfoChip(Icons.quiz_outlined, 'Quiz'),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const Divider(),

                  // YouTube Suggestions
                  if (_isLoadingVideos)
                    const Center(child: LinearProgressIndicator())
                  else if (_suggestedVideos.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20.0, vertical: 8.0),
                      child: Row(
                        children: const [
                          Icon(Icons.smart_display,
                              color: Colors.red, size: 20),
                          SizedBox(width: 8),
                          Text('AI Recommended Videos',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 140,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _suggestedVideos.length,
                        itemBuilder: (context, index) {
                          final video = _suggestedVideos[index];
                          final isSelected = _currentPlayingVideo?['videoId'] ==
                              video['videoId'];

                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _currentPlayingVideo = video;
                              });
                            },
                            child: Container(
                              width: 160,
                              margin: const EdgeInsets.only(right: 12),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                border: isSelected
                                    ? Border.all(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary,
                                        width: 2)
                                    : null,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.network(
                                      video['thumbnail'],
                                      height: 90,
                                      width: 160,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 4.0),
                                    child: Text(
                                      video['title'],
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: isSelected
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                        color: isSelected
                                            ? Theme.of(context)
                                                .colorScheme
                                                .primary
                                            : null,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const Divider(),
                  ],

                  // Course Content List
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20.0, vertical: 12.0),
                    child: Text('Course Content',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
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
                                _fetchVideos(); // Refresh suggestions
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
                        title: Text(chapter.title,
                            style: TextStyle(
                                fontWeight: isActive
                                    ? FontWeight.bold
                                    : FontWeight.normal)),
                        subtitle: Text('Lesson ${index + 1} • 10-15 mins'),
                      );
                    },
                  ),
                  const SizedBox(height: 40),
                ],
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
