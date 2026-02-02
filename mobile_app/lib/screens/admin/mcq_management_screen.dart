import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:passion_academia/widgets/infinity_loader.dart';

class McqManagementScreen extends StatefulWidget {
  const McqManagementScreen({super.key});

  @override
  State<McqManagementScreen> createState() => _McqManagementScreenState();
}

class _McqManagementScreenState extends State<McqManagementScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AdminProvider>().fetchMcqs());
  }

  @override
  Widget build(BuildContext context) {
    final adminProvider = context.watch<AdminProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('MCQ Repository'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddMcqDialog(context),
          ),
        ],
      ),
      body: adminProvider.isLoading
          ? const Center(child: InfinityLoader(message: 'Loading Questions...'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: adminProvider.mcqs.length,
              itemBuilder: (context, index) {
                final mcq = adminProvider.mcqs[index];
                final options = mcq['options'];

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ExpansionTile(
                    title: Text(
                      mcq['question_text'] ?? 'No Question Text',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: Text(
                      '${mcq['subject']} • ${mcq['course_slug']}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Options:',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            if (options is List)
                              ...options.map((e) => Text('• $e')).toList(),
                            const SizedBox(height: 8),
                            Text('Correct: ${mcq['correct_answer']}',
                                style: const TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.bold)),
                            const SizedBox(height: 16),
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton.icon(
                                icon:
                                    const Icon(Icons.delete, color: Colors.red),
                                label: const Text('Delete',
                                    style: TextStyle(color: Colors.red)),
                                onPressed: () async {
                                  final success = await adminProvider
                                      .deleteMcq(mcq['id'].toString());
                                  if (success && mounted) {
                                    adminProvider.fetchMcqs();
                                  }
                                },
                              ),
                            )
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  void _showAddMcqDialog(BuildContext context) {
    final questionController = TextEditingController();
    final opt1Controller = TextEditingController();
    final opt2Controller = TextEditingController();
    final opt3Controller = TextEditingController();
    final opt4Controller = TextEditingController();
    final correctController = TextEditingController();
    final subjectController = TextEditingController();
    final courseSlugController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New MCQ'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                  controller: questionController,
                  decoration: const InputDecoration(labelText: 'Question')),
              TextField(
                  controller: opt1Controller,
                  decoration: const InputDecoration(labelText: 'Option 1')),
              TextField(
                  controller: opt2Controller,
                  decoration: const InputDecoration(labelText: 'Option 2')),
              TextField(
                  controller: opt3Controller,
                  decoration: const InputDecoration(labelText: 'Option 3')),
              TextField(
                  controller: opt4Controller,
                  decoration: const InputDecoration(labelText: 'Option 4')),
              TextField(
                  controller: correctController,
                  decoration:
                      const InputDecoration(labelText: 'Correct Answer')),
              TextField(
                  controller: subjectController,
                  decoration: const InputDecoration(labelText: 'Subject')),
              TextField(
                  controller: courseSlugController,
                  decoration: const InputDecoration(labelText: 'Course Slug')),
            ],
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (questionController.text.isNotEmpty &&
                  opt1Controller.text.isNotEmpty) {
                final success = await context.read<AdminProvider>().addMcq({
                  'question_text': questionController.text,
                  'options': [
                    opt1Controller.text,
                    opt2Controller.text,
                    opt3Controller.text,
                    opt4Controller.text
                  ],
                  'correct_answer': correctController.text,
                  'subject': subjectController.text,
                  'course_slug': courseSlugController.text,
                  'course_type': courseSlugController.text, // Fallback
                });
                if (success && mounted) {
                  context.read<AdminProvider>().fetchMcqs();
                  Navigator.pop(context);
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}
