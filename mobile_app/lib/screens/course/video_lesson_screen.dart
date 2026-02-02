import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';
import 'package:passion_academia/core/services/youtube_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';
import 'package:passion_academia/screens/quiz/quiz_screen.dart';

class VideoLessonScreen extends StatefulWidget {
  final Course course;
  final Chapter initialChapter;
  final List<Chapter>? chapters;

  const VideoLessonScreen({
    super.key,
    required this.course,
    required this.initialChapter,
    this.chapters,
  });

  @override
  State<VideoLessonScreen> createState() => _VideoLessonScreenState();
}

class _VideoLessonScreenState extends State<VideoLessonScreen> {
  late Chapter _activeChapter;
  List<Map<String, dynamic>> _suggestedVideos = [];
  bool _isLoadingVideos = false;
  Map<String, dynamic>? _currentPlayingVideo;
  late List<Chapter> _chapters;

  @override
  void initState() {
    super.initState();
    _activeChapter = widget.initialChapter;
    _chapters = widget.chapters ?? [];
    _fetchVideos();
  }

  Future<void> _fetchVideos() async {
    if (!mounted) return;
    setState(() {
      _isLoadingVideos = true;
      _suggestedVideos = [];
      _currentPlayingVideo = null;
    });

    // 1. Check if chapter has a direct video URL (primary source)
    if (_activeChapter.videoUrl != null &&
        _activeChapter.videoUrl!.isNotEmpty) {
      final videoUrl = _activeChapter.videoUrl!;
      if (videoUrl.contains('youtube.com') || videoUrl.contains('youtu.be')) {
        String? videoId;
        if (videoUrl.contains('v=')) {
          videoId = videoUrl.split('v=').last.split('&').first;
        } else if (videoUrl.contains('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/').last.split('?').first;
        }

        if (videoId != null) {
          _currentPlayingVideo = {
            'videoId': videoId,
            'title': _activeChapter.title,
            'thumbnail':
                'https://img.youtube.com/vi/$videoId/maxresdefault.jpg',
          };
        }
      }
    }

    // 2. Fallback: Search YouTube if no direct URL or to provide recommendations
    try {
      final query =
          '${widget.course.title} ${_activeChapter.title} lecture passion academia';
      final videos = await YoutubeService.searchVideos(query);

      if (mounted) {
        setState(() {
          _suggestedVideos = videos;
          // If no primary video was found, use the first YouTube search result
          if (_currentPlayingVideo == null && videos.isNotEmpty) {
            _currentPlayingVideo = videos.first;
          }
          _isLoadingVideos = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching lesson videos: $e');
      if (mounted) {
        setState(() => _isLoadingVideos = false);
      }
    }
  }

  void _goToNextChapter() {
    final currentIndex = _chapters.indexWhere((c) => c.id == _activeChapter.id);
    if (currentIndex != -1 && currentIndex < _chapters.length - 1) {
      setState(() {
        _activeChapter = _chapters[currentIndex + 1];
        _fetchVideos();
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('You have reached the end of this subject!')),
      );
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
            Expanded(
              child: ListView(
                children: [
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
                            _buildInfoChip(Icons.video_library_outlined,
                                _activeChapter.duration ?? '12 mins'),
                            const SizedBox(width: 12),
                            _buildInfoChip(
                                Icons.description_outlined, 'Materials'),
                            const SizedBox(width: 12),
                            GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => QuizScreen(
                                        subjectTitle: _activeChapter.title,
                                        courseSlug: widget.course.slug,
                                        chapterTitle: _activeChapter.title,
                                      ),
                                    ),
                                  );
                                },
                                child: _buildInfoChip(
                                    Icons.quiz_outlined, 'Quiz')),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _activeChapter.description ??
                              'Learn the fundamentals of ${_activeChapter.title} in this detailed video lesson. We cover all key concepts required for your exams.',
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.color
                                        ?.withOpacity(0.8),
                                    height: 1.5,
                                  ),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () async {
                                  final auth = context.read<AuthProvider>();
                                  await auth.markChapterCompleted(
                                      widget.course.slug, _activeChapter.id);

                                  // Award XP for completion
                                  await auth.updateStats(20, false);

                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                            content: Text(
                                                'Lesson completed! +20 XP awarded 🚀')));
                                    _goToNextChapter();
                                  }
                                },
                                icon: const Icon(Icons.check_circle_outline),
                                label: const Text('Complete Lesson'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white,
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            IconButton.filledTonal(
                              onPressed: _goToNextChapter,
                              icon: const Icon(Icons.skip_next),
                              tooltip: 'Next Lesson',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Divider(),
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
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20.0, vertical: 12.0),
                    child: const Text('Course Content',
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
                                _fetchVideos();
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
