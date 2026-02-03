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
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<CourseProvider>().fetchCourses());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final courseProvider = context.watch<CourseProvider>();
    final adminProvider = context.watch<AdminProvider>();

    final filteredCourses = courseProvider.courses.where((course) {
      final query = _searchQuery.toLowerCase();
      final title = course.title.toLowerCase();
      final category = course.category.toLowerCase();
      final slug = course.slug.toLowerCase();
      return title.contains(query) ||
          category.contains(query) ||
          slug.contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: Colors.grey[50],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCourseDialog(context),
        backgroundColor: Theme.of(context).colorScheme.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Class', style: TextStyle(color: Colors.white)),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: courseProvider.isLoading
                ? const Center(
                    child: InfinityLoader(message: 'Loading Classes...'))
                : filteredCourses.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filteredCourses.length,
                        itemBuilder: (context, index) {
                          final course = filteredCourses[index];
                          return _buildCourseCard(
                              context, course, adminProvider, courseProvider);
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
      color: Colors.white,
      child: TextField(
        controller: _searchController,
        onChanged: (v) => setState(() => _searchQuery = v),
        decoration: InputDecoration(
          hintText: 'Search programs, categories, or slugs...',
          prefixIcon:
              const Icon(Icons.search_rounded, color: Color(0xFF64748B)),
          filled: true,
          fillColor: const Color(0xFFF1F5F9),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.school_outlined, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isEmpty
                ? 'No classes found'
                : 'No matches for "$_searchQuery"',
            style: TextStyle(color: Colors.grey[600], fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseCard(BuildContext context, dynamic course,
      AdminProvider admin, CourseProvider provider) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFFEEF2FF),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              course.title[0].toUpperCase(),
              style: const TextStyle(
                color: Color(0xFF4F46E5),
                fontWeight: FontWeight.w900,
                fontSize: 18,
              ),
            ),
          ),
        ),
        title: Text(
          course.title,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 15,
            color: Color(0xFF0F172A),
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            children: [
              _buildBadge(course.category, const Color(0xFF4F46E5)),
              const SizedBox(width: 8),
              _buildBadge(course.slug, const Color(0xFF64748B)),
            ],
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon:
                  const Icon(Icons.edit_note_rounded, color: Color(0xFF4F46E5)),
              onPressed: () => _showCourseDialog(context, course: course),
            ),
            IconButton(
              icon: const Icon(Icons.delete_sweep_rounded,
                  color: Color(0xFFEF4444)),
              onPressed: () => _confirmDelete(context, course, admin, provider),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 8,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  void _showCourseDialog(BuildContext context, {dynamic course}) {
    final isEditing = course != null;
    final formKey = GlobalKey<FormState>();

    final titleCtrl = TextEditingController(text: course?.title);
    final categoryCtrl = TextEditingController(text: course?.category);
    final slugCtrl = TextEditingController(text: course?.slug);
    final descCtrl = TextEditingController(text: course?.description);
    final orderCtrl =
        TextEditingController(text: course?.displayOrder?.toString() ?? '0');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(isEditing ? 'Edit Class' : 'Add New Class'),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Title'),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                TextFormField(
                  controller: categoryCtrl,
                  decoration: const InputDecoration(
                      labelText: 'Category (e.g., School, Entrance)'),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                TextFormField(
                  controller: slugCtrl,
                  decoration: const InputDecoration(
                      labelText: 'Slug (unique identifier)'),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                TextFormField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description'),
                  maxLines: 2,
                ),
                TextFormField(
                  controller: orderCtrl,
                  decoration: const InputDecoration(labelText: 'Display Order'),
                  keyboardType: TextInputType.number,
                ),
              ],
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
                  'title': titleCtrl.text.trim(),
                  'category': categoryCtrl.text.trim(),
                  'slug': slugCtrl.text.trim().toLowerCase(),
                  'description': descCtrl.text.trim(),
                  'display_order': int.tryParse(orderCtrl.text) ?? 0,
                };

                final admin = context.read<AdminProvider>();
                bool success;
                if (isEditing) {
                  success =
                      await admin.updateCourse(course.id.toString(), data);
                } else {
                  success = await admin.addCourse(data);
                }

                if (success && mounted) {
                  context.read<CourseProvider>().fetchCourses();
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content:
                            Text(isEditing ? 'Class updated' : 'Class added')),
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

  void _confirmDelete(BuildContext context, dynamic course, AdminProvider admin,
      CourseProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Class?'),
        content: Text(
            'Are you sure you want to delete "${course.title}"? This cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              final success = await admin.deleteCourse(course.id.toString());
              if (success && mounted) {
                provider.fetchCourses();
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Class deleted')),
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
