import 'package:flutter/material.dart';

class GlobalErrorScreen extends StatelessWidget {
  final FlutterErrorDetails details;

  const GlobalErrorScreen({super.key, required this.details});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.error.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.error_outline_rounded,
                    color: Theme.of(context).colorScheme.error,
                    size: 80,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Oops! Something went wrong',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  'An unexpected error occurred. Our team has been notified.',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: () {
                    // Simple restart - go to initial route
                    Navigator.of(context)
                        .pushNamedAndRemoveUntil('/', (route) => false);
                  },
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Try Again'),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    // Show error details in a dialog for advanced users/debugging
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Error Details'),
                        content: SingleChildScrollView(
                          child: Text(
                            details.toString(),
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 12,
                            ),
                          ),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Close'),
                          ),
                        ],
                      ),
                    );
                  },
                  child: Text(
                    'Show Technical Details',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
