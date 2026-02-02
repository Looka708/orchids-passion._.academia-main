import 'package:flutter/material.dart';
import 'package:passion_academia/widgets/common/app_header.dart';
import 'package:passion_academia/widgets/common/stat_card.dart';
import 'package:passion_academia/widgets/course_card.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/course_provider.dart';
import 'package:passion_academia/screens/course/course_detail_screen.dart';

class TestsScreen extends StatelessWidget {
  const TestsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final testPrepCourses = context
        .watch<CourseProvider>()
        .courses
        .where((c) =>
            c.category == 'Entrance' || c.title.toLowerCase().contains('prep'))
        .toList();

    return Scaffold(
      appBar: const AppHeader(title: 'Mock Tests', showProfile: false),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gamification Dashboard
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const StatCard(
                    value: '12 Days',
                    label: 'Current Streak 🔥',
                    icon: Icons.local_fire_department,
                    color: Colors.orange,
                  ),
                  const SizedBox(height: 16),
                  _buildLeaderboardPreview(context),
                ],
              ),
            ),

            // Daily Quiz Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: _buildDailyQuizCard(context),
            ),

            const SizedBox(height: 32),

            // Test Categories
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Entrance Test Preparation',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Specialized preparation for AFNS, PAF, and Military Colleges.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.65,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    itemCount: testPrepCourses.length,
                    itemBuilder: (context, index) {
                      return CourseCard(
                        course: testPrepCourses[index],
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CourseDetailScreen(
                                  course: testPrepCourses[index]),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildLeaderboardPreview(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Streak Legends',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              Icon(Icons.emoji_events_outlined,
                  size: 20, color: Theme.of(context).colorScheme.primary),
            ],
          ),
          const SizedBox(height: 12),
          _buildLeaderItem(context, '1', 'Ahmed Ali', '24 Days'),
          const Divider(height: 12),
          _buildLeaderItem(context, '2', 'Sara Khan', '21 Days'),
          const Divider(height: 12),
          _buildLeaderItem(context, '3', 'Zainab Q.', '19 Days'),
        ],
      ),
    );
  }

  Widget _buildLeaderItem(
      BuildContext context, String rank, String name, String score) {
    return Row(
      children: [
        CircleAvatar(
          radius: 12,
          backgroundColor:
              Theme.of(context).colorScheme.primary.withOpacity(0.2),
          child: Text(rank,
              style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary)),
        ),
        const SizedBox(width: 12),
        Expanded(child: Text(name, style: const TextStyle(fontSize: 14))),
        Text(score,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }

  Widget _buildDailyQuizCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary,
            const Color(0xFF66BB6A),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.bolt, color: Colors.white, size: 32),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Daily Quiz',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Win +50 XP today',
                    style: TextStyle(
                        color: Colors.white.withOpacity(0.8), fontSize: 13),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Theme.of(context).colorScheme.primary,
              minimumSize: const Size(double.infinity, 48),
            ),
            child: const Text('Start Now'),
          ),
        ],
      ),
    );
  }
}
