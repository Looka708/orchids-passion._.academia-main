import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/course_provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:passion_academia/widgets/infinity_loader.dart';

class CourseManagementScreen extends StatefulWidget {
  const CourseManagementScreen({super.key});

  @override
  State<CourseManagementScreen> createState() => _CourseManagementScreenState();
}

class _CourseManagementScreenState extends State<CourseManagementScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<CourseProvider>().fetchCourses());
  }

  @override
  Widget build(BuildContext context) {
    final courseProvider = context.watch<CourseProvider>();
    final adminProvider = context.watch<AdminProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Course Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddCourseDialog(context),
          ),
        ],
      ),
      body: courseProvider.isLoading
          ? const Center(child: InfinityLoader(message: 'Loading Courses...'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: courseProvider.courses.length,
              itemBuilder: (context, index) {
                final course = courseProvider.courses[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    title: Text(course.title),
                    subtitle: Text(course.category),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: () async {
                        final confirm = await _showDeleteConfirm(context);
                        if (confirm == true) {
                          final success = await adminProvider
                              .deleteCourse(course.id.toString());
                          if (success) {
                            courseProvider.fetchCourses(); // Refresh
                          }
                        }
                      },
                    ),
                  ),
                );
              },
            ),
    );
  }

  Future<bool?> _showDeleteConfirm(BuildContext context) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Course?'),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
  }

  void _showAddCourseDialog(BuildContext context) {
    final titleController = TextEditingController();
    final categoryController = TextEditingController();
    final slugController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Course'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
                controller: titleController,
                decoration: const InputDecoration(labelText: 'Title')),
            TextField(
                controller: categoryController,
                decoration: const InputDecoration(labelText: 'Category')),
            TextField(
                controller: slugController,
                decoration: const InputDecoration(labelText: 'Slug')),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (titleController.text.isNotEmpty) {
                final success = await context.read<AdminProvider>().addCourse({
                  'name': titleController.text,
                  'category': categoryController.text,
                  'slug': slugController.text,
                });
                if (success && mounted) {
                  context.read<CourseProvider>().fetchCourses();
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
