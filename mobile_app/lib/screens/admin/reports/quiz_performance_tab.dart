import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:passion_academia/models/report_models.dart';
import 'package:fl_chart/fl_chart.dart';

class QuizPerformanceTab extends StatelessWidget {
  final DateTime startDate;
  final DateTime endDate;

  const QuizPerformanceTab({
    super.key,
    required this.startDate,
    required this.endDate,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<QuizPerformanceReport>>(
      future: context.read<AdminProvider>().fetchQuizPerformanceReport(
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
          return const Center(
              child: Text('No quiz data found for this period.'));
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSubjectPassRates(reports),
              const SizedBox(height: 24),
              const Text(
                'Performance Distribution',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildDistributionChart(reports),
              const SizedBox(height: 24),
              const Text(
                'Subject Breakdown',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildSubjectDetails(reports),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSubjectPassRates(List<QuizPerformanceReport> reports) {
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: reports.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final report = reports[index];
          return Container(
            width: 140,
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
                Text(report.subject,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text('${(report.passRate * 100).toStringAsFixed(0)}% Pass Rate',
                    style: const TextStyle(
                        color: Colors.green, fontWeight: FontWeight.bold)),
                Text('${report.totalAttempts} attempts',
                    style: const TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDistributionChart(List<QuizPerformanceReport> reports) {
    double totalFail = 0;
    double totalPass = 0;
    double totalExcellence = 0;

    for (var r in reports) {
      totalFail += r.scoreDistribution['0-40'] ?? 0;
      totalPass += r.scoreDistribution['40-70'] ?? 0;
      totalExcellence += r.scoreDistribution['70-100'] ?? 0;
    }

    final total = totalFail + totalPass + totalExcellence;
    if (total == 0) return const SizedBox.shrink();

    return Container(
      height: 200,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: PieChart(
        PieChartData(
          sections: [
            PieChartSectionData(
                value: totalFail,
                color: Colors.redAccent,
                title: 'Fail',
                radius: 50,
                titleStyle: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
            PieChartSectionData(
                value: totalPass,
                color: Colors.orangeAccent,
                title: 'Pass',
                radius: 50,
                titleStyle: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
            PieChartSectionData(
                value: totalExcellence,
                color: Colors.greenAccent,
                title: 'Excellent',
                radius: 50,
                titleStyle: const TextStyle(
                    color: Colors.indigo, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildSubjectDetails(List<QuizPerformanceReport> reports) {
    return Column(
      children: reports
          .map((report) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(report.subject,
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Text(
                              'Avg Score: ${report.averageScore.toStringAsFixed(1)}%',
                              style: TextStyle(
                                  color: Colors.grey[600], fontSize: 12)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${report.totalAttempts} Exams',
                        style: const TextStyle(
                            fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ))
          .toList(),
    );
  }
}
