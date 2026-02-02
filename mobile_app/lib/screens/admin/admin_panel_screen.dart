import 'package:flutter/material.dart';
import 'package:passion_academia/widgets/infinity_loader.dart';
import 'package:passion_academia/screens/admin/user_management_screen.dart';
import 'package:passion_academia/screens/admin/course_management_screen.dart';
import 'package:passion_academia/screens/admin/mcq_management_screen.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    // Simulate loading for LegoLoader experience
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) setState(() => _isLoading = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF010001),
        body: InfinityLoader(message: 'Accessing Admin Console...'),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Console'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Management'),
            const SizedBox(height: 15),
            _buildAdminCard(
              title: 'Users',
              subtitle: 'Manage student accounts and permissions',
              icon: Icons.people_alt_rounded,
              color: Colors.blue,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const UserManagementScreen()),
                );
              },
            ),
            const SizedBox(height: 15),
            _buildAdminCard(
              title: 'Courses',
              subtitle: 'Add or edit course content',
              icon: Icons.library_books_rounded,
              color: Colors.green,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const CourseManagementScreen()),
                );
              },
            ),
            const SizedBox(height: 15),
            _buildAdminCard(
              title: 'MCQ Repository',
              subtitle: 'Update question bank',
              icon: Icons.quiz_rounded,
              color: Colors.orange,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const McqManagementScreen()),
                );
              },
            ),
            const SizedBox(height: 30),
            _buildSectionTitle('Analytics'),
            const SizedBox(height: 15),
            Row(
              children: [
                Expanded(
                  child: _buildStatMiniCard(
                    'Active Users',
                    '1,234',
                    Icons.trending_up,
                    Colors.purple,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: _buildStatMiniCard(
                    'Quizzes Taken',
                    '45.2k',
                    Icons.assignment_turned_in,
                    Colors.teal,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.bold,
        letterSpacing: 1.5,
        color: Colors.grey,
      ),
    );
  }

  Widget _buildAdminCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded,
                size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildStatMiniCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}
