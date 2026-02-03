import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DateRangeFilter extends StatelessWidget {
  final DateTime startDate;
  final DateTime endDate;
  final Function(DateTime, DateTime) onRangeChanged;

  const DateRangeFilter({
    super.key,
    required this.startDate,
    required this.endDate,
    required this.onRangeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.calendar_today_rounded,
              size: 16, color: Color(0xFF64748B)),
          const SizedBox(width: 8),
          Text(
            '${DateFormat('MMM d, y').format(startDate)} - ${DateFormat('MMM d, y').format(endDate)}',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.arrow_drop_down_rounded, color: Color(0xFF64748B)),
        ],
      ),
    );
  }

  static Future<void> showRangePicker(BuildContext context, DateTime start,
      DateTime end, Function(DateTime, DateTime) callback) async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2024),
      lastDate: DateTime.now(),
      initialDateRange: DateTimeRange(start: start, end: end),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF4F46E5),
              onPrimary: Colors.white,
              onSurface: Color(0xFF0F172A),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      callback(picked.start, picked.end);
    }
  }
}
