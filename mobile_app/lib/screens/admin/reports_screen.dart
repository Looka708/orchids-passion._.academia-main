import 'package:flutter/material.dart';
import 'package:passion_academia/widgets/date_range_filter.dart';
import 'package:passion_academia/screens/admin/reports/user_activity_tab.dart';
import 'package:passion_academia/screens/admin/reports/quiz_performance_tab.dart';
import 'package:passion_academia/screens/admin/reports/course_engagement_tab.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _endDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Analytics & Reports',
          style:
              TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: GestureDetector(
                onTap: () => DateRangeFilter.showRangePicker(
                  context,
                  _startDate,
                  _endDate,
                  (s, e) => setState(() {
                    _startDate = s;
                    _endDate = e;
                  }),
                ),
                child: DateRangeFilter(
                  startDate: _startDate,
                  endDate: _endDate,
                  onRangeChanged: (s, e) => setState(() {
                    _startDate = s;
                    _endDate = e;
                  }),
                ),
              ),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF4F46E5),
          unselectedLabelColor: const Color(0xFF64748B),
          indicatorColor: const Color(0xFF4F46E5),
          tabs: const [
            Tab(text: 'Activity'),
            Tab(text: 'Quizzes'),
            Tab(text: 'Courses'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          UserActivityTab(startDate: _startDate, endDate: _endDate),
          QuizPerformanceTab(startDate: _startDate, endDate: _endDate),
          CourseEngagementTab(startDate: _startDate, endDate: _endDate),
        ],
      ),
    );
  }
}
