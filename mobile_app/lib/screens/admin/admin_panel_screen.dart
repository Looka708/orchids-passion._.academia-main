import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:passion_academia/core/providers/course_provider.dart';
import 'package:passion_academia/widgets/infinity_loader.dart';
import 'package:passion_academia/screens/admin/user_management_screen.dart';
import 'package:passion_academia/screens/admin/course_management_screen.dart';
import 'package:passion_academia/screens/admin/mcq_management_screen.dart';
import 'package:passion_academia/screens/admin/notification_panel.dart';
import 'package:passion_academia/screens/admin/reports_screen.dart';

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
    _tabController = TabController(length: 6, vsync: this);
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
      backgroundColor: const Color(0xFFF8FAFC), // Slate 50
      appBar: AppBar(
        title: const Text(
          'Command Center',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 22,
            letterSpacing: -0.5,
          ),
        ),
        centerTitle: false,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A), // Slate 900
        actions: [
          IconButton(
            onPressed: () => adminProvider.fetchDashboardStats(),
            icon: const Icon(Icons.refresh_rounded),
          ),
          const SizedBox(width: 8),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9), // Slate 100
              borderRadius: BorderRadius.circular(12),
            ),
            child: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: const Color(0xFF64748B), // Slate 500
              indicatorSize: TabBarIndicatorSize.tab,
              indicator: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: const Color(0xFF4F46E5), // Indigo 600
              ),
              isScrollable: true,
              dividerColor: Colors.transparent,
              tabs: const [
                Tab(
                    child: Text('Overview',
                        style: TextStyle(fontWeight: FontWeight.bold))),
                Tab(
                    child: Text('Students',
                        style: TextStyle(fontWeight: FontWeight.bold))),
                Tab(
                    child: Text('Programs',
                        style: TextStyle(fontWeight: FontWeight.bold))),
                Tab(
                    child: Text('Questions',
                        style: TextStyle(fontWeight: FontWeight.bold))),
                Tab(
                    child: Text('Alerts',
                        style: TextStyle(fontWeight: FontWeight.bold))),
                Tab(
                    child: Text('Reports',
                        style: TextStyle(fontWeight: FontWeight.bold))),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(context, stats),
          const UserManagementScreen(), // Reusing existing screens as tabs
          const CourseManagementScreen(),
          const McqManagementScreen(),
          const NotificationPanel(),
          const ReportsScreen(),
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
            'System Overview',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              letterSpacing: -1,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Monitor performance and manage core assets.',
            style: TextStyle(
              fontSize: 15,
              color: const Color(0xFF64748B),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 28),

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
              _buildFastAction(
                'New Q',
                Icons.add_task_rounded,
                const Color(0xFF4F46E5),
                () => _tabController.animateTo(3),
              ),
              _buildFastAction(
                'Broadcast',
                Icons.sensors_rounded,
                const Color(0xFFF59E0B),
                () => _tabController.animateTo(4),
              ),
              _buildFastAction(
                'Users',
                Icons.group_add_rounded,
                const Color(0xFF10B981),
                () => _tabController.animateTo(1),
              ),
              _buildFastAction(
                'Reports',
                Icons.analytics_rounded,
                const Color(0xFFEC4899),
                () => _tabController.animateTo(5),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Recent Database Overview
          const Text(
            'Latest Programs',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 16),
          Consumer<CourseProvider>(
            builder: (context, provider, _) {
              final courses = provider.courses.take(5).toList();
              if (courses.isEmpty) {
                return Container(
                  padding: const EdgeInsets.all(40),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: const Center(
                    child: Text('No programs found',
                        style: TextStyle(color: Color(0xFF64748B))),
                  ),
                );
              }
              return Column(
                children: courses.map((course) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEEF2FF),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.school_rounded,
                              color: Color(0xFF4F46E5), size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                course.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              Text(
                                course.category,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF64748B),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.chevron_right_rounded,
                            color: const Color(0xFFCBD5E1), size: 18),
                      ],
                    ),
                  );
                }).toList(),
              );
            },
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F172A),
              letterSpacing: -1,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFastAction(
      String label, IconData icon, Color color, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF475569),
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
