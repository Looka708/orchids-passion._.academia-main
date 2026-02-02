import 'dart:async';
import 'package:flutter/material.dart';
import 'package:passion_academia/core/theme.dart';
import 'package:passion_academia/models/course.dart';
import 'package:passion_academia/widgets/common/app_header.dart';

import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/quiz_provider.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';

enum QuizState { intro, quiz, results }

class QuizScreen extends StatefulWidget {
  final String subjectTitle;
  final String courseSlug;

  const QuizScreen({
    super.key,
    required this.subjectTitle,
    required this.courseSlug,
  });

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  QuizState _state = QuizState.intro;
  int _currentQuestionIndex = 0;
  int _score = 0;
  int _timeLeft = 20;
  Timer? _timer;
  final Map<int, int> _selectedAnswers = {};

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<QuizProvider>().fetchQuestions(
            courseSlug: widget.courseSlug,
            subject: widget.subjectTitle,
          );
    });
  }

  void _startQuiz() {
    final questions = context.read<QuizProvider>().questions;
    if (questions.isEmpty) return;

    setState(() {
      _state = QuizState.quiz;
      _currentQuestionIndex = 0;
      _score = 0;
      _selectedAnswers.clear();
      _timeLeft = 20;
    });
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 0) {
        setState(() {
          _timeLeft--;
        });
      } else {
        _handleTimeUp();
      }
    });
  }

  void _handleTimeUp() {
    if (!_selectedAnswers.containsKey(_currentQuestionIndex)) {
      _selectedAnswers[_currentQuestionIndex] = -1; // -1 for skipped/timed out
    }
    _nextQuestion();
  }

  void _nextQuestion() {
    final questions = context.read<QuizProvider>().questions;
    if (_currentQuestionIndex < questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _timeLeft = 20;
      });
      _startTimer();
    } else {
      _finishQuiz();
    }
  }

  void _finishQuiz() {
    _timer?.cancel();
    final questions = context.read<QuizProvider>().questions;
    int correct = 0;
    _selectedAnswers.forEach((qIdx, oIdx) {
      if (oIdx != -1 &&
          questions[qIdx].options[oIdx] == questions[qIdx].correctAnswer) {
        correct++;
      }
    });

    final finalScore = ((correct / questions.length) * 100).toInt();
    setState(() {
      _score = finalScore;
      _state = QuizState.results;
    });

    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) {
      context.read<QuizProvider>().submitResult(
            userId: auth.user!.id,
            courseSlug: widget.courseSlug,
            subject: widget.subjectTitle,
            score: finalScore,
            totalQuestions: questions.length,
            correctAnswers: correct,
          );
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final quizProvider = context.watch<QuizProvider>();
    final questions = quizProvider.questions;

    return Scaffold(
      appBar: AppHeader(
        title: _state == QuizState.quiz
            ? 'Question ${_currentQuestionIndex + 1}/${questions.length}'
            : '${widget.subjectTitle} Quiz',
        showProfile: false,
      ),
      body: quizProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : questions.isEmpty
              ? _buildEmptyState()
              : AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _buildBody(questions),
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.quiz_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('No questions available for this subject yet.'),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Go Back'),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(List<Question> questions) {
    switch (_state) {
      case QuizState.intro:
        return _buildIntro(questions);
      case QuizState.quiz:
        return _buildQuiz(questions);
      case QuizState.results:
        return _buildResults(questions);
    }
  }

  Widget _buildIntro(List<Question> questions) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.quiz_outlined,
                size: 80, color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(height: 32),
          Text(
            'Ready to test your knowledge?',
            style: Theme.of(context)
                .textTheme
                .headlineSmall
                ?.copyWith(fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'Subject: ${widget.subjectTitle}\nQuestions: ${questions.length}\nTime: 20s per question',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Theme.of(context).textTheme.bodyMedium?.color,
                height: 1.6),
          ),
          const SizedBox(height: 48),
          ElevatedButton(
            onPressed: _startQuiz,
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Begin Challenge'),
                SizedBox(width: 8),
                Icon(Icons.arrow_forward, size: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuiz(List<Question> questions) {
    final question = questions[_currentQuestionIndex];
    final isUrdu = question.language == 'urdu';

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Timer and Progress
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: (_currentQuestionIndex + 1) / questions.length,
                    minHeight: 8,
                    backgroundColor: Theme.of(context).colorScheme.secondary,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _timeLeft <= 5
                      ? Colors.red.withOpacity(0.1)
                      : Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: _timeLeft <= 5
                          ? Colors.red
                          : Theme.of(context).colorScheme.primary),
                ),
                child: Row(
                  children: [
                    Icon(Icons.timer_outlined,
                        size: 16,
                        color: _timeLeft <= 5
                            ? Colors.red
                            : Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 4),
                    Text(
                      '${_timeLeft}s',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _timeLeft <= 5
                            ? Colors.red
                            : Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Question Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                  color:
                      Theme.of(context).colorScheme.outline.withOpacity(0.5)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Text(
              question.text,
              style: isUrdu
                  ? AppTheme.urduStyle(fontSize: 26)
                  : Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(height: 1.4),
              textAlign: isUrdu ? TextAlign.right : TextAlign.left,
            ),
          ),
          const SizedBox(height: 32),

          // Options
          Expanded(
            child: ListView.builder(
              itemCount: question.options.length,
              itemBuilder: (context, idx) {
                final option = question.options[idx];
                final isSelected =
                    _selectedAnswers[_currentQuestionIndex] == idx;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _selectedAnswers[_currentQuestionIndex] = idx;
                      });
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Theme.of(context)
                                .colorScheme
                                .primary
                                .withOpacity(0.1)
                            : Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).colorScheme.outline,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          if (!isUrdu) ...[
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? Theme.of(context).colorScheme.primary
                                    : Theme.of(context).colorScheme.secondary,
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                String.fromCharCode(65 + idx),
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected
                                      ? Colors.white
                                      : Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.color,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                          ],
                          Expanded(
                            child: Text(
                              option,
                              style: isUrdu
                                  ? AppTheme.urduStyle(
                                      fontSize: 22,
                                      color: isSelected
                                          ? Theme.of(context)
                                              .colorScheme
                                              .primary
                                          : null)
                                  : TextStyle(
                                      fontSize: 16,
                                      color: isSelected
                                          ? Theme.of(context)
                                              .colorScheme
                                              .primary
                                          : Theme.of(context)
                                              .colorScheme
                                              .onSurface,
                                      fontWeight: isSelected
                                          ? FontWeight.bold
                                          : FontWeight.normal,
                                    ),
                              textAlign:
                                  isUrdu ? TextAlign.right : TextAlign.left,
                            ),
                          ),
                          if (isUrdu) ...[
                            const SizedBox(width: 16),
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? Theme.of(context).colorScheme.primary
                                    : Theme.of(context).colorScheme.secondary,
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                String.fromCharCode(65 + idx),
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected
                                      ? Colors.white
                                      : Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.color,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          ElevatedButton(
            onPressed: _selectedAnswers.containsKey(_currentQuestionIndex)
                ? _nextQuestion
                : null,
            child: Text(_currentQuestionIndex == questions.length - 1
                ? 'See Results'
                : 'Confirm Answer'),
          ),
        ],
      ),
    );
  }

  Widget _buildResults(List<Question> questions) {
    final bool isPassed = _score >= 70;

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(30),
              decoration: BoxDecoration(
                color:
                    (isPassed ? Colors.green : Colors.orange).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isPassed ? Icons.emoji_events : Icons.refresh,
                size: 80,
                color: isPassed ? Colors.green : Colors.orange,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              isPassed ? 'Excellent Work!' : 'Keep Practicing!',
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'You scored $_score% on this test.',
              style: TextStyle(
                  fontSize: 16,
                  color: Theme.of(context).textTheme.bodySmall?.color),
            ),
            const SizedBox(height: 32),

            // Stats Row
            Row(
              children: [
                _buildResultStat(
                    'Correct',
                    '${(_score * questions.length / 100).toInt()}',
                    Colors.green),
                const SizedBox(width: 16),
                _buildResultStat(
                    'XP Earned', isPassed ? '+50' : '+10', Colors.amber),
              ],
            ),

            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: _startQuiz,
              child: const Text('Retake Quiz'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Back to Dashboard'),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildResultStat(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: Theme.of(context).colorScheme.outline.withOpacity(0.5)),
        ),
        child: Column(
          children: [
            Text(label, style: const TextStyle(fontSize: 12)),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                  fontSize: 24, fontWeight: FontWeight.bold, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
