import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:passion_academia/models/report_models.dart';
import 'package:fl_chart/fl_chart.dart';

class UserActivityTab extends StatelessWidget {
  final DateTime startDate;
  final DateTime endDate;

  const UserActivityTab({
    super.key,
    required this.startDate,
    required this.endDate,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<UserActivityReport>>(
      future: context.read<AdminProvider>().fetchUserActivityReport(
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
              child: Text('No activity data found for this period.'));
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSummaryHeader(reports),
              const SizedBox(height: 24),
              const Text(
                'XP Progression',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildActivityChart(reports),
              const SizedBox(height: 24),
              const Text(
                'Top Performers',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildPerformersList(reports),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummaryHeader(List<UserActivityReport> reports) {
    final totalXp = reports.fold(0, (sum, item) => sum + item.totalXp);
    final avgStreak = reports.isEmpty
        ? 0
        : reports.fold(0, (sum, item) => sum + item.currentStreak) /
            reports.length;

    return Row(
      children: [
        _buildStatCard('Total XP', totalXp.toString(), Colors.indigo),
        const SizedBox(width: 12),
        _buildStatCard(
            'Avg Streak', avgStreak.toStringAsFixed(1), Colors.orange),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: TextStyle(color: color, fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text(value,
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityChart(List<UserActivityReport> reports) {
    // Aggregate daily activity across all users
    Map<String, int> dailyXp = {};
    for (var r in reports) {
      for (var d in r.dailyActivity) {
        final dateKey = d.date.toIso8601String().split('T')[0];
        dailyXp[dateKey] = (dailyXp[dateKey] ?? 0) + d.xpEarned;
      }
    }

    final sortedDates = dailyXp.keys.toList()..sort();
    if (sortedDates.isEmpty)
      return const SizedBox(
          height: 200, child: Center(child: Text('No chart data')));

    return Container(
      height: 250,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: LineChart(
        LineChartData(
          gridData: const FlGridData(show: false),
          titlesData: const FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: List.generate(sortedDates.length, (i) {
                return FlSpot(
                    i.toDouble(), dailyXp[sortedDates[i]]!.toDouble());
              }),
              isCurved: true,
              color: const Color(0xFF4F46E5),
              barWidth: 4,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: const Color(0xFF4F46E5).withOpacity(0.1),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformersList(List<UserActivityReport> reports) {
    final sorted = List<UserActivityReport>.from(reports)
      ..sort((a, b) => b.totalXp.compareTo(a.totalXp));

    final top5 = sorted.take(5).toList();

    return Column(
      children: top5
          .map((user) => Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFFEEF2FF),
                    child: Text(user.userName[0].toUpperCase(),
                        style: const TextStyle(color: Color(0xFF4F46E5))),
                  ),
                  title: Text(user.userName,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(
                      '${user.totalXp} XP • 🔥 ${user.currentStreak} day streak'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                ),
              ))
          .toList(),
    );
  }
}
