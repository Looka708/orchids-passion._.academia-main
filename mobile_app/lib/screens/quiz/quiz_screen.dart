import 'dart:async';
import 'package:flutter/material.dart';
import 'package:passion_academia/core/theme.dart';
import 'package:passion_academia/models/course.dart';

enum QuizState { intro, quiz, results }

class QuizScreen extends StatefulWidget {
  final String subjectTitle;

  const QuizScreen({super.key, required this.subjectTitle});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  QuizState _state = QuizState.intro;
  int _currentQuestionIndex = 0;
  int _score = 0;
  int _timeLeft = 17;
  Timer? _timer;
  final Map<int, int> _selectedAnswers = {};

  final List<Question> _mockQuestions = [
    Question(
      id: '1',
      text: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
      correctAnswer: 'Mitochondria',
    ),
    Question(
      id: '2',
      text: 'پودے اپنی خوراک کس عمل سے تیار کرتے ہیں؟',
      options: ['عمل تنفس', 'فوٹوسنتھیسز', 'انجذاب', 'انجماد'],
      correctAnswer: 'فوٹوسنتھیسز',
      language: 'urdu',
    ),
    Question(
      id: '3',
      text: 'Which gas do plants absorb from the atmosphere?',
      options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
      correctAnswer: 'Carbon Dioxide',
    ),
  ];

  void _startQuiz() {
    setState(() {
      _state = QuizState.quiz;
      _currentQuestionIndex = 0;
      _score = 0;
      _selectedAnswers.clear();
      _timeLeft = 17;
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
        _nextQuestion();
      }
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < _mockQuestions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _timeLeft = 17;
      });
      _startTimer();
    } else {
      _finishQuiz();
    }
  }

  void _finishQuiz() {
    _timer?.cancel();
    int correct = 0;
    _selectedAnswers.forEach((qIdx, oIdx) {
      if (_mockQuestions[qIdx].options[oIdx] ==
          _mockQuestions[qIdx].correctAnswer) {
        correct++;
      }
    });
    setState(() {
      _score = ((correct / _mockQuestions.length) * 100).toInt();
      _state = QuizState.results;
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.subjectTitle} Quiz'),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    switch (_state) {
      case QuizState.intro:
        return _buildIntro();
      case QuizState.quiz:
        return _buildQuiz();
      case QuizState.results:
        return _buildResults();
    }
  }

  Widget _buildIntro() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.quiz, size: 80, color: AppTheme.primaryColor),
            const SizedBox(height: 24),
            Text(
              'Start Your Test',
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              'You are about to start a test on ${widget.subjectTitle}. Total questions: ${_mockQuestions.length}',
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: Theme.of(context).textTheme.bodyMedium?.color),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _startQuiz,
              child: const Text('Begin Test'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuiz() {
    final question = _mockQuestions[_currentQuestionIndex];
    final isUrdu = question.language == 'urdu';

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          LinearProgressIndicator(
            value: (_currentQuestionIndex + 1) / _mockQuestions.length,
            backgroundColor: Theme.of(context).colorScheme.secondary,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question ${_currentQuestionIndex + 1}/${_mockQuestions.length}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  const Icon(Icons.timer_outlined, size: 20),
                  const SizedBox(width: 4),
                  Text(
                    '${_timeLeft}s',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Text(
                question.text,
                style: isUrdu
                    ? AppTheme.urduStyle(fontSize: 24)
                    : Theme.of(context).textTheme.titleLarge,
                textAlign: isUrdu ? TextAlign.right : TextAlign.left,
              ),
            ),
          ),
          const SizedBox(height: 24),
          ...question.options.asMap().entries.map((entry) {
            final idx = entry.key;
            final option = entry.value;
            final isSelected = _selectedAnswers[_currentQuestionIndex] == idx;

            return Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: OutlinedButton(
                onPressed: () {
                  setState(() {
                    _selectedAnswers[_currentQuestionIndex] = idx;
                  });
                },
                style: OutlinedButton.styleFrom(
                  backgroundColor: isSelected
                      ? Theme.of(context).colorScheme.primary.withOpacity(0.1)
                      : null,
                  side: BorderSide(
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Theme.of(context).colorScheme.outline,
                    width: isSelected ? 2 : 1,
                  ),
                  padding: const EdgeInsets.all(16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: Row(
                  children: [
                    if (!isUrdu) ...[
                      CircleAvatar(
                        radius: 12,
                        backgroundColor: isSelected
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).colorScheme.secondary,
                        child: Text(
                          String.fromCharCode(65 + idx),
                          style: TextStyle(
                            fontSize: 12,
                            color: isSelected
                                ? Colors.white
                                : Theme.of(context).textTheme.bodySmall?.color,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    Expanded(
                      child: Text(
                        option,
                        style: isUrdu
                            ? AppTheme.urduStyle(
                                fontSize: 20,
                                color: isSelected
                                    ? Theme.of(context).colorScheme.primary
                                    : null)
                            : TextStyle(
                                color: isSelected
                                    ? Theme.of(context).colorScheme.primary
                                    : Theme.of(context).colorScheme.onSurface,
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                        textAlign: isUrdu ? TextAlign.right : TextAlign.left,
                      ),
                    ),
                    if (isUrdu) ...[
                      const SizedBox(width: 12),
                      CircleAvatar(
                        radius: 12,
                        backgroundColor: isSelected
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).colorScheme.secondary,
                        child: Text(
                          String.fromCharCode(65 + idx),
                          style: TextStyle(
                            fontSize: 12,
                            color: isSelected
                                ? Colors.white
                                : Theme.of(context).textTheme.bodySmall?.color,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }),
          const Spacer(),
          ElevatedButton(
            onPressed: _selectedAnswers.containsKey(_currentQuestionIndex)
                ? _nextQuestion
                : null,
            child: Text(_currentQuestionIndex == _mockQuestions.length - 1
                ? 'Finish'
                : 'Next'),
          ),
        ],
      ),
    );
  }

  Widget _buildResults() {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Icon(Icons.stars, size: 80, color: Colors.amber),
            const SizedBox(height: 16),
            Text(
              'Quiz Completed!',
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Your Score: $_score%',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: _score >= 70
                        ? Theme.of(context).colorScheme.primary
                        : Colors.red,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 32),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _mockQuestions.length,
              itemBuilder: (context, index) {
                final question = _mockQuestions[index];
                final selectedIdx = _selectedAnswers[index];
                final isCorrect = selectedIdx != null &&
                    question.options[selectedIdx] == question.correctAnswer;

                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${index + 1}. ${question.text}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              isCorrect ? Icons.check_circle : Icons.cancel,
                              color: isCorrect ? Colors.green : Colors.red,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                isCorrect
                                    ? 'Correct: ${question.correctAnswer}'
                                    : 'Incorrect. Correct: ${question.correctAnswer}',
                                style: TextStyle(
                                  color: isCorrect ? Colors.green : Colors.red,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _startQuiz,
              child: const Text('Try Again'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Back to Course'),
            ),
          ],
        ),
      ),
    );
  }
}
