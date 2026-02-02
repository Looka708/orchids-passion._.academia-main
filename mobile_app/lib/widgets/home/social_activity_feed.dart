import 'package:flutter/material.dart';

class SocialActivityFeed extends StatelessWidget {
  const SocialActivityFeed({super.key});

  @override
  Widget build(BuildContext context) {
    const activities = [
      {
        'user': 'Aisha K.',
        'action': 'earned 100 XP in Biology',
        'time': '2m ago'
      },
      {
        'user': 'Bilal A.',
        'action': 'started PAF Prep Course',
        'time': '5m ago'
      },
      {'user': 'Sara M.', 'action': 'reached Level 5!', 'time': '12m ago'},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Social Activity',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          ...activities.map((a) => Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 12,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: Text(a['user']![0],
                          style: const TextStyle(
                              fontSize: 10, color: Colors.white)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: RichText(
                        text: TextSpan(
                          style: TextStyle(
                              fontSize: 12,
                              color: Theme.of(context).colorScheme.onSurface),
                          children: [
                            TextSpan(
                                text: a['user'],
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                            TextSpan(text: ' ${a['action']}'),
                          ],
                        ),
                      ),
                    ),
                    Text(a['time']!,
                        style:
                            const TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
