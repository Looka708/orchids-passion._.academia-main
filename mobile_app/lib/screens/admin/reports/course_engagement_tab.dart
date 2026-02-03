import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:passion_academia/models/report_models.dart';

class CourseEngagementTab extends StatelessWidget {
  final DateTime startDate;
  final DateTime endDate;

  const CourseEngagementTab({
    super.key,
    required this.startDate,
    required this.endDate,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<CourseEngagementReport>>(
      future: context.read<AdminProvider>().fetchCourseEngagementReport(
            startDate: startDate,
            endDate: endDate,
          ),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        final reports = snapshot.data ?? [];
        if (reports.isEmpty) {
          return const Center(child: Text('No course engagement data found.'));
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enrollment Popularity',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildEnrollmentRanking(reports),
              const SizedBox(height: 24),
              const Text(
                'Engagement Metrics',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildMetricsGrid(reports),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEnrollmentRanking(List<CourseEngagementReport> reports) {
    final sorted = List<CourseEngagementReport>.from(reports)
      ..sort((a, b) => b.totalEnrollments.compareTo(a.totalEnrollments));

    return Column(
      children: sorted.map((report) {
        final percentage = sorted.first.totalEnrollments == 0
            ? 0.0
            : report.totalEnrollments / sorted.first.totalEnrollments;

        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(report.courseTitle,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 13)),
                  Text('${report.totalEnrollments} Students',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 4),
              LinearProgressIndicator(
                value: percentage,
                backgroundColor: const Color(0xFFF1F5F9),
                valueColor:
                    const AlwaysStoppedAnimation<Color>(Color(0xFF4F46E5)),
                minHeight: 8,
                borderRadius: BorderRadius.circular(4),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildMetricsGrid(List<CourseEngagementReport> reports) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.5,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: reports.length,
      itemBuilder: (context, index) {
        final report = reports[index];
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(report.courseTitle,
                  style: const TextStyle(
                      fontSize: 11,
                      color: Colors.grey,
                      fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
              const SizedBox(height: 4),
              Text('${report.activeStudents}',
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A))),
              const Text('Active Students',
                  style: TextStyle(fontSize: 9, color: Colors.grey)),
            ],
          ),
        );
      },
    );
  }
}
