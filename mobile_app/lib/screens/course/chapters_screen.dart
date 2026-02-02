import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/course_provider.dart';
import 'package:passion_academia/screens/quiz/quiz_screen.dart';
import 'package:passion_academia/widgets/common/app_header.dart';

import 'package:passion_academia/widgets/infinity_loader.dart';

class ChaptersScreen extends StatefulWidget {
  final String courseSlug;
  final String subjectTitle;

  const ChaptersScreen({
    super.key,
    required this.courseSlug,
    required this.subjectTitle,
  });

  @override
  State<ChaptersScreen> createState() => _ChaptersScreenState();
}

class _ChaptersScreenState extends State<ChaptersScreen> {
  double _mcqCount = 20;
  bool _isInitialLoading = true;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      context
          .read<CourseProvider>()
          .fetchChaptersForSubject(widget.courseSlug, widget.subjectTitle);
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
    final chapters = courseProvider.getChaptersForSubject(
        widget.courseSlug, widget.subjectTitle);

    if (_isInitialLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF010001),
        body: InfinityLoader(message: 'Preparing your Path...'),
      );
    }

    return Scaffold(
      appBar: AppHeader(
        title: '${widget.subjectTitle} Chapters',
        showProfile: false,
      ),
      body: Column(
        children: [
          // MCQ Count Selector
          _buildMcqSelector(),

          const Divider(height: 1),

          // Chapters List
          Expanded(
            child: chapters.isEmpty && courseProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : chapters.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: chapters.length,
                        itemBuilder: (context, index) {
                          final chapter = chapters[index];
                          return _buildChapterCard(chapter);
                        },
                      ),
          ),
        ],
      ),
      bottomNavigationBar:
          chapters.isNotEmpty ? _buildStartSubjectTest() : null,
    );
  }

  Widget _buildMcqSelector() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Test Length',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${_mcqCount.toInt()} MCQs',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Slider(
            value: _mcqCount,
            min: 5,
            max: 50,
            divisions: 9,
            label: _mcqCount.round().toString(),
            onChanged: (double value) {
              setState(() {
                _mcqCount = value;
              });
            },
          ),
          Text(
            'Select how many questions you want to solve in this session.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildChapterCard(String chapterTitle) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.menu_book,
            color: Theme.of(context).colorScheme.primary,
            size: 20,
          ),
        ),
        title: Text(
          chapterTitle,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Practice MCQs for this chapter'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => QuizScreen(
                subjectTitle: widget.subjectTitle,
                courseSlug: widget.courseSlug,
                chapterTitle: chapterTitle,
                mcqLimit: _mcqCount.toInt(),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStartSubjectTest() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, -4),
            blurRadius: 10,
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => QuizScreen(
                subjectTitle: widget.subjectTitle,
                courseSlug: widget.courseSlug,
                mcqLimit: _mcqCount.toInt(),
              ),
            ),
          );
        },
        child: const Text('Start Full Subject Test'),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.auto_stories_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.primary.withOpacity(0.2)),
          const SizedBox(height: 16),
          const Text('No chapters found for this subject.'),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => QuizScreen(
                    subjectTitle: widget.subjectTitle,
                    courseSlug: widget.courseSlug,
                    mcqLimit: _mcqCount.toInt(),
                  ),
                ),
              );
            },
            child: const Text('Try Full Subject Test'),
          ),
        ],
      ),
    );
  }
}
