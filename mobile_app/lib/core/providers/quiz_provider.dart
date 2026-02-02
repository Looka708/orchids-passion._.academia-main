import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:passion_academia/models/course.dart';

class QuizProvider extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  List<Question> _questions = [];
  bool _isLoading = false;

  bool get isLoading => _isLoading;
  List<Question> get questions => _questions;

  Future<void> fetchQuestions({
    required String courseSlug,
    required String subject,
    String? chapter,
    int mcqLimit = 20,
  }) async {
    _isLoading = true;
    _questions = [];
    notifyListeners();

    try {
      // Artificial delay to show the premium pencil loader
      await Future.delayed(const Duration(seconds: 2));

      debugPrint(
          'Fetching MCQs for: $courseSlug, $subject, Chapter: $chapter (Limit: $mcqLimit)');

      // Helper to try different subject formats
      Future<List<dynamic>> tryQuery(String sub) async {
        // Try course_type first
        var query = _supabase
            .from('mcqs')
            .select('*')
            .ilike('course_type', courseSlug)
            .ilike('subject', sub);

        if (chapter != null) {
          query = query.ilike('chapter', chapter);
        }

        var data = await query
            .order('question_number', ascending: true)
            .limit(mcqLimit);

        if (data.isEmpty) {
          // Try course_slug
          var fallbackQuery = _supabase
              .from('mcqs')
              .select('*')
              .ilike('course_slug', courseSlug)
              .ilike('subject', sub);

          if (chapter != null) {
            fallbackQuery = fallbackQuery.ilike('chapter', chapter);
          }

          data = await fallbackQuery
              .order('question_number', ascending: true)
              .limit(mcqLimit);
        }
        return data;
      }

      // Try original subject name
      var data = await tryQuery(subject);

      // If no results, try variations (replacing hyphens with spaces or vice versa)
      if (data.isEmpty) {
        if (subject.contains('-')) {
          data = await tryQuery(subject.replaceAll('-', ' '));
        } else if (subject.contains(' ')) {
          data = await tryQuery(subject.replaceAll(' ', '-'));
        }
      }

      debugPrint('Fetched ${data.length} questions');

      _questions = data.map((json) {
        // Handle options which could be stored as a List or JSON string
        List<String> options = [];
        if (json['options'] is List) {
          options = List<String>.from(json['options']);
        } else if (json['options'] is String) {
          // Fallback if it's a string representation
          try {
            final decoded = jsonDecode(json['options']);
            if (decoded is List) {
              options = List<String>.from(decoded);
            }
          } catch (_) {
            options = json['options'].toString().split(',');
          }
        }

        return Question(
          id: json['id'].toString(),
          text: json['question_text'] ?? '',
          options: options,
          correctAnswer: json['correct_answer'] ?? '',
          language: json['language'],
        );
      }).toList();
    } catch (e) {
      debugPrint('Error fetching MCQs: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> generateAiQuiz() async {
    _isLoading = true;
    _questions = [];
    notifyListeners();

    try {
      // 1. Simulate AI 'Think Time' with Lego Loader
      await Future.delayed(const Duration(seconds: 3));

      // 2. Fetch random questions from the database (RPC call would be better, but client-side random is okay for now)
      final response = await _supabase
          .from('mcqs')
          .select()
          .limit(50); // Fetch a pool to randomize from

      if (response.isEmpty) {
        // Fallback if DB is empty
        _questions = [
          const Question(
              id: 'ai-1',
              text: 'What is the primary function of a mitochondria?',
              options: [
                'Energy production',
                'Protein synthesis',
                'Cell division',
                'DNA storage'
              ],
              correctAnswer: 'Energy production'),
          const Question(
              id: 'ai-2',
              text: 'Which planet has the most moons?',
              options: ['Jupiter', 'Saturn', 'Mars', 'Venus'],
              correctAnswer: 'Saturn'),
          // Add more mock AI questions here if needed
        ];
      } else {
        final List<dynamic> data = List.from(response)..shuffle();
        // Take top 20
        final selected = data.take(20).toList();

        _questions = selected.map((json) {
          List<String> options = [];
          if (json['options'] is List) {
            options = List<String>.from(json['options']);
          } else {
            // Handle string case
            options = json['options'].toString().split(',');
          }

          return Question(
            id: json['id'].toString(),
            text: json['question_text'] ?? 'AI Question',
            options: options,
            correctAnswer: json['correct_answer'] ?? '',
            language: json['language'],
          );
        }).toList();
      }
    } catch (e) {
      debugPrint('AI Generation Error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> submitResult({
    required String userId,
    required String courseSlug,
    required String subject,
    required int score,
    required int totalQuestions,
    required int correctAnswers,
  }) async {
    // Here you would normally update progress in Firebase/Supabase
    // For now, let's just log it
    debugPrint('Submitting result: $score% for $userId in $subject');
  }
}
