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
  }) async {
    _isLoading = true;
    _questions = [];
    notifyListeners();

    try {
      var query = _supabase
          .from('mcqs')
          .select('*')
          .eq('course_type', courseSlug)
          .eq('subject', subject);

      if (chapter != null) {
        query = query.eq('chapter', chapter);
      }

      final data =
          await query.order('question_number', ascending: true).limit(20);

      _questions = (data as List).map((json) {
        // Handle options which could be stored as a List or JSON string
        List<String> options = [];
        if (json['options'] is List) {
          options = List<String>.from(json['options']);
        } else if (json['options'] is String) {
          // Fallback if it's a string representation
          options = json['options'].toString().split(',');
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
