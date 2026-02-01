import 'package:flutter/material.dart';

class SubjectCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final String description;
  final VoidCallback? onTap;

  const SubjectCard({
    super.key,
    required this.title,
    required this.icon,
    required this.description,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Theme.of(context)
                          .colorScheme
                          .primary
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon,
                        color: Theme.of(context).colorScheme.primary, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: Text(
                  description,
                  style: TextStyle(
                    fontSize: 13,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onTap,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Start Prep'),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward, size: 14),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
