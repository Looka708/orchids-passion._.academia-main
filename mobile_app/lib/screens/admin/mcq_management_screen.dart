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
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AdminProvider>().fetchMcqs());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final adminProvider = context.watch<AdminProvider>();

    final filteredMcqs = adminProvider.mcqs.where((mcq) {
      final query = _searchQuery.toLowerCase();
      final question = (mcq['question_text'] ?? '').toString().toLowerCase();
      final subject = (mcq['subject'] ?? '').toString().toLowerCase();
      final course = (mcq['course_slug'] ?? '').toString().toLowerCase();
      final chapter = (mcq['chapter'] ?? '').toString().toLowerCase();
      return question.contains(query) ||
          subject.contains(query) ||
          course.contains(query) ||
          chapter.contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: Colors.grey[50],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showMcqDialog(context),
        backgroundColor: Theme.of(context).colorScheme.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label:
            const Text('Add Question', style: TextStyle(color: Colors.white)),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: adminProvider.isLoading
                ? const Center(
                    child: InfinityLoader(message: 'Loading Questions...'))
                : filteredMcqs.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filteredMcqs.length,
                        itemBuilder: (context, index) {
                          return _buildMcqCard(context, filteredMcqs[index]);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) => setState(() => _searchQuery = value),
        decoration: InputDecoration(
          hintText: 'Search questions, subjects, or courses...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = '');
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.grey[100],
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isEmpty
                ? 'No questions found'
                : 'No matches for "$_searchQuery"',
            style: TextStyle(color: Colors.grey[600], fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildMcqCard(BuildContext context, Map<String, dynamic> mcq) {
    final options = mcq['options'] as List? ?? [];
    final correctAnswer = mcq['correct_answer'].toString();
    final chapter = mcq['chapter']?.toString() ?? 'Uncategorized';

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          mcq['question_text'] ?? 'No Question Text',
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildBadge(mcq['subject'] ?? 'General', Colors.blue),
              const SizedBox(width: 8),
              _buildBadge(mcq['course_slug'] ?? 'All', Colors.orange),
              const SizedBox(width: 8),
              _buildBadge(chapter, Colors.purple),
            ],
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(),
                const SizedBox(height: 8),
                const Text('Options',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Colors.grey)),
                const SizedBox(height: 12),
                ...List.generate(options.length, (i) {
                  final isCorrect =
                      options[i].toString().trim() == correctAnswer.trim();
                  return Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: isCorrect
                          ? Colors.green.withOpacity(0.1)
                          : Colors.grey[50],
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isCorrect
                            ? Colors.green.withOpacity(0.3)
                            : Colors.grey[200]!,
                      ),
                    ),
                    child: Row(
                      children: [
                        Text('${String.fromCharCode(65 + i)}.',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: isCorrect
                                    ? Colors.green
                                    : Colors.grey[600])),
                        const SizedBox(width: 12),
                        Expanded(child: Text(options[i].toString())),
                        if (isCorrect)
                          const Icon(Icons.check_circle,
                              color: Colors.green, size: 18),
                      ],
                    ),
                  );
                }),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _showMcqDialog(context, mcq: mcq),
                      icon: const Icon(Icons.edit_outlined),
                      label: const Text('Edit'),
                    ),
                    const SizedBox(width: 8),
                    TextButton.icon(
                      onPressed: () => _confirmDelete(context, mcq),
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      style: TextButton.styleFrom(foregroundColor: Colors.red),
                      label: const Text('Delete'),
                    ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  void _showMcqDialog(BuildContext context, {Map<String, dynamic>? mcq}) {
    final isEditing = mcq != null;
    final formKey = GlobalKey<FormState>();
    final admin = context.read<AdminProvider>();

    final questionCtrl = TextEditingController(text: mcq?['question_text']);
    final optionsCtrls = List.generate(4, (i) {
      final options = mcq?['options'] as List? ?? [];
      return TextEditingController(
          text: i < options.length ? options[i].toString() : '');
    });
    final correctCtrl = TextEditingController(text: mcq?['correct_answer']);
    final subjectCtrl = TextEditingController(text: mcq?['subject']);
    final courseCtrl = TextEditingController(text: mcq?['course_slug']);
    final chapterCtrl =
        TextEditingController(text: mcq?['chapter'] ?? 'Uncategorized');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(isEditing ? 'Edit Question' : 'Add New Question'),
        content: SizedBox(
          width: MediaQuery.of(context).size.width * 0.9,
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: questionCtrl,
                    decoration: const InputDecoration(
                        labelText: 'Question Text', alignLabelWithHint: true),
                    maxLines: 3,
                    validator: (v) => v!.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  const Align(
                      alignment: Alignment.centerLeft,
                      child: Text('Options',
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.grey))),
                  ...List.generate(
                      4,
                      (i) => TextFormField(
                            controller: optionsCtrls[i],
                            decoration: InputDecoration(
                                labelText:
                                    'Option ${String.fromCharCode(65 + i)}'),
                            validator: (v) => v!.isEmpty ? 'Required' : null,
                          )),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: correctCtrl,
                    decoration: const InputDecoration(
                        labelText: 'Correct Answer (Must match an option)'),
                    validator: (v) {
                      if (v!.isEmpty) return 'Required';
                      final val = v.trim();
                      if (!optionsCtrls.any((c) => c.text.trim() == val))
                        return 'Must match one of the options';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  _buildAutocompleteField(
                      'Subject', subjectCtrl, admin.uniqueSubjects),
                  const SizedBox(height: 16),
                  _buildAutocompleteField(
                      'Course Slug', courseCtrl, admin.uniqueCourses),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: chapterCtrl,
                    decoration:
                        const InputDecoration(labelText: 'Chapter Name'),
                    validator: (v) => v!.isEmpty ? 'Required' : null,
                  ),
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                final data = {
                  'question_text': questionCtrl.text.trim(),
                  'options': optionsCtrls.map((c) => c.text.trim()).toList(),
                  'correct_answer': correctCtrl.text.trim(),
                  'subject': subjectCtrl.text.trim(),
                  'chapter': chapterCtrl.text.trim(),
                  'course_slug': courseCtrl.text.trim(),
                  'course_type': courseCtrl.text.trim(),
                };

                bool success;
                if (isEditing) {
                  success = await admin.updateMcq(mcq['id'].toString(), data);
                } else {
                  success = await admin.addMcq(data);
                }

                if (success && mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: Text(
                            isEditing ? 'Question updated' : 'Question added')),
                  );
                }
              }
            },
            child: Text(isEditing ? 'Update' : 'Add'),
          ),
        ],
      ),
    );
  }

  Widget _buildAutocompleteField(
      String label, TextEditingController controller, List<String> options) {
    return Autocomplete<String>(
      optionsBuilder: (TextEditingValue textEditingValue) {
        if (textEditingValue.text == '') {
          return const Iterable<String>.empty();
        }
        return options.where((String option) {
          return option
              .toLowerCase()
              .contains(textEditingValue.text.toLowerCase());
        });
      },
      onSelected: (String selection) {
        controller.text = selection;
      },
      fieldViewBuilder: (context, textController, focusNode, onFieldSubmitted) {
        // Initialize textController with our controller's text
        if (textController.text.isEmpty && controller.text.isNotEmpty) {
          textController.text = controller.text;
        }

        textController.addListener(() {
          controller.text = textController.text;
        });

        return TextFormField(
          controller: textController,
          focusNode: focusNode,
          decoration: InputDecoration(labelText: label),
          validator: (v) => v!.isEmpty ? 'Required' : null,
        );
      },
    );
  }

  void _confirmDelete(BuildContext context, Map<String, dynamic> mcq) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Question?'),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              final success = await context
                  .read<AdminProvider>()
                  .deleteMcq(mcq['id'].toString());
              if (success && mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Question deleted')),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
