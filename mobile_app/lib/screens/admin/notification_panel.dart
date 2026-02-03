import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:intl/intl.dart';

class NotificationPanel extends StatefulWidget {
  const NotificationPanel({super.key});

  @override
  State<NotificationPanel> createState() => _NotificationPanelState();
}

class _NotificationPanelState extends State<NotificationPanel> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();
  String _selectedType = 'announcement';
  bool _isSending = false;
  bool _isScheduled = false;
  DateTime _scheduledDate = DateTime.now().add(const Duration(hours: 1));

  @override
  void dispose() {
    _titleController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _scheduledDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (date != null && mounted) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_scheduledDate),
      );

      if (time != null) {
        setState(() {
          _scheduledDate = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  Future<void> _sendNotification() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSending = true);

    try {
      final adminProvider = context.read<AdminProvider>();

      bool success;
      if (_isScheduled) {
        success = await adminProvider.scheduleBroadcast({
          'title': _titleController.text.trim(),
          'message': _messageController.text.trim(),
          'type': _selectedType,
          'scheduledAt': _scheduledDate,
        });
      } else {
        success = await adminProvider.sendGlobalNotification(
          _titleController.text.trim(),
          _messageController.text.trim(),
          _selectedType,
        );
      }

      if (mounted) {
        setState(() => _isSending = false);
        if (success) {
          _titleController.clear();
          _messageController.clear();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(_isScheduled
                  ? 'Notification scheduled for ${DateFormat.yMMMd().add_jm().format(_scheduledDate)}'
                  : 'Notification sent to all users successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to process notification.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSending = false);
        debugPrint('Broadcasting Error: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('An error occurred: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Broadcasting',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.indigo,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Send an announcement or alert to every registered student.',
            style: TextStyle(color: Colors.grey[600], fontSize: 14),
          ),
          const SizedBox(height: 32),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: Colors.grey[200]!),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Notification Details',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      controller: _titleController,
                      decoration: InputDecoration(
                        labelText: 'Title',
                        hintText: 'e.g. New Mock Test Available',
                        prefixIcon: const Icon(Icons.title),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (value) => value == null || value.isEmpty
                          ? 'Please enter a title'
                          : null,
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: _messageController,
                      maxLines: 4,
                      decoration: InputDecoration(
                        labelText: 'Message Body',
                        hintText:
                            'Enter the details of your announcement here...',
                        prefixIcon: const Padding(
                          padding: EdgeInsets.only(bottom: 60),
                          child: Icon(Icons.message),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (value) => value == null || value.isEmpty
                          ? 'Please enter a message'
                          : null,
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Category',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
                        color: Color(0xFF94A3B8),
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _buildTypeChip('announcement', 'Announcement',
                            Icons.campaign_rounded),
                        _buildTypeChip('achievement', 'Achievement',
                            Icons.emoji_events_rounded),
                        _buildTypeChip('quiz', 'New Quiz', Icons.quiz_rounded),
                        _buildTypeChip(
                            'login', 'Urgent', Icons.warning_amber_rounded),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Scheduling Section
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.schedule,
                                      color: Colors.indigo[400], size: 20),
                                  const SizedBox(width: 12),
                                  const Text(
                                    'Schedule for later',
                                    style:
                                        TextStyle(fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              Switch.adaptive(
                                value: _isScheduled,
                                activeColor: Colors.indigo,
                                onChanged: (value) =>
                                    setState(() => _isScheduled = value),
                              ),
                            ],
                          ),
                          if (_isScheduled) ...[
                            const Divider(height: 24),
                            InkWell(
                              onTap: _pickDateTime,
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      DateFormat.yMMMd()
                                          .add_jm()
                                          .format(_scheduledDate),
                                      style: const TextStyle(
                                        color: Colors.indigo,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                  const Icon(Icons.edit_calendar,
                                      color: Colors.indigo),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isSending ? null : _sendNotification,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.indigo,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isSending
                            ? const SizedBox(
                                height: 24,
                                width: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(_isScheduled
                                      ? Icons.event_available
                                      : Icons.send),
                                  const SizedBox(width: 12),
                                  Text(
                                    _isScheduled
                                        ? 'Schedule Broadcast'
                                        : 'Send to All Users',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          _buildTipCard(),
        ],
      ),
    );
  }

  Widget _buildTypeChip(String value, String label, IconData icon) {
    final isSelected = _selectedType == value;
    final color =
        isSelected ? const Color(0xFF4F46E5) : const Color(0xFF64748B);

    return GestureDetector(
      onTap: () => setState(() => _selectedType = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEEF2FF) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color:
                isSelected ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTipCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7), // Amber 100
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFCD34D)), // Amber 300
      ),
      child: Row(
        children: [
          const Icon(Icons.lightbulb_outline_rounded, color: Color(0xFFB45309)),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              'PRO TIP: Scheduled notifications will appear in student feeds exactly at the selected time.',
              style: TextStyle(
                color: const Color(0xFF92400E),
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
