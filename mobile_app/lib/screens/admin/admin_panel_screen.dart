import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:passion_academia/core/providers/course_provider.dart';
import 'package:passion_academia/widgets/infinity_loader.dart';
import 'package:passion_academia/screens/admin/user_management_screen.dart';
import 'package:passion_academia/screens/admin/course_management_screen.dart';
import 'package:passion_academia/screens/admin/mcq_management_screen.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    Future.microtask(() {
      context.read<AdminProvider>().fetchDashboardStats();
      context.read<CourseProvider>().fetchCourses();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final adminProvider = context.watch<AdminProvider>();
    final stats = adminProvider.dashboardStats;

    if (adminProvider.isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF010001),
        body: Center(child: InfinityLoader(message: 'Accessing Dashboard...')),
      );
    }

    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: Colors.grey[50], // Match web bg-slate-50
      appBar: AppBar(
        title: const Text(
          'Admin Dashboard',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.indigo,
          unselectedLabelColor: Colors.grey,
          indicatorColor: Colors.indigo,
          isScrollable: true,
          tabs: const [
            Tab(icon: Icon(Icons.grid_view), text: 'Overview'),
            Tab(icon: Icon(Icons.people), text: 'Users'),
            Tab(icon: Icon(Icons.school), text: 'Classes'),
            Tab(icon: Icon(Icons.quiz), text: 'MCQs'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(context, stats),
          const UserManagementScreen(), // Reusing existing screens as tabs
          const CourseManagementScreen(),
          const McqManagementScreen(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab(BuildContext context, Map<String, int> stats) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Text
          const Text(
            'Admin Dashboard',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.transparent,
              decoration: TextDecoration.none,
              decorationColor: Colors.indigo,
              shadows: [Shadow(color: Colors.black, offset: Offset(0, -5))],
            ),
          ).foregroundGradient(
            const LinearGradient(colors: [Colors.indigo, Colors.purple]),
          ),
          const SizedBox(height: 8),
          const Text(
            'Manage users, classes, and monitor database statistics.',
            style: TextStyle(fontSize: 14, color: Colors.grey),
          ),
          const SizedBox(height: 24),

          // Quick Stats Grid
          GridView.count(
            crossAxisCount: 2,
            childAspectRatio: 1.3,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _buildStatCard(
                'Total Users',
                '${stats['users']}',
                Icons.people,
                Colors.blue,
              ),
              _buildStatCard(
                'Total MCQs',
                '${stats['mcqs']}',
                Icons.storage,
                Colors.purple,
              ),
              _buildStatCard(
                'Active Classes',
                '${stats['classes']}',
                Icons.grid_view,
                Colors.amber,
              ),
              _buildStatCard(
                'Support Chats',
                'Live',
                Icons.chat_bubble,
                Colors.green,
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  context,
                  'Add New MCQ',
                  Icons.add_circle_outline,
                  Colors.indigo,
                  () => _tabController.animateTo(3),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  context,
                  'Generate Exam',
                  Icons.description_outlined,
                  Colors.teal,
                  () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Exam Generator coming soon!')),
                    );
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Recent Database Overview
          Card(
            elevation: 2,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: const [
                      Icon(Icons.storage, color: Colors.indigo),
                      SizedBox(width: 8),
                      Text(
                        'Recent Database Overview',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                Consumer<CourseProvider>(
                  builder: (context, provider, _) {
                    final courses = provider.courses.take(5).toList();
                    if (courses.isEmpty) {
                      return const Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Text('No courses found.'),
                      );
                    }
                    return ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: courses.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final course = courses[index];
                        return ListTile(
                          leading: Text(
                            _getIconForCourse(course.slug),
                            style: const TextStyle(fontSize: 20),
                          ),
                          title: Text(course.title),
                          trailing: const Text(
                            'View',
                            style: TextStyle(
                                color: Colors.indigo,
                                fontWeight: FontWeight.bold),
                          ),
                          onTap: () => _tabController.animateTo(2),
                        );
                      },
                    );
                  },
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () =>
                          _tabController.animateTo(3), // Go to MCQs
                      child: const Text('View All MCQs'),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: color, width: 4)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: color,
                    letterSpacing: 0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, String label, IconData icon,
      Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 100,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 28),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getIconForCourse(String slug) {
    if (slug.contains('afns')) return '🎖️';
    if (slug.contains('paf')) return '✈️';
    if (slug.contains('mcj')) return '⚖️';
    if (slug.contains('mcm')) return '🏥';
    return '📚';
  }
}

extension GradientText on Text {
  Widget foregroundGradient(Gradient gradient) {
    return ShaderMask(
      shaderCallback: (bounds) => gradient.createShader(
        Rect.fromLTWH(0, 0, bounds.width, bounds.height),
      ),
      blendMode: BlendMode.srcIn,
      child: this,
    );
  }
}
