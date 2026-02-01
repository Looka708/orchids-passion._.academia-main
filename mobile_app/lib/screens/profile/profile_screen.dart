import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 24),
            CircleAvatar(
              radius: 50,
              backgroundColor: Theme.of(context).colorScheme.secondary,
              child: Icon(Icons.person,
                  size: 50, color: Theme.of(context).colorScheme.primary),
            ),
            const SizedBox(height: 16),
            Text(
              'Student Name',
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            Text(
              'student@example.com',
              style: TextStyle(
                  color: Theme.of(context).textTheme.bodyMedium?.color),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  _buildStatCard(context, '1200', 'XP Points', Icons.stars),
                  const SizedBox(width: 16),
                  _buildStatCard(
                      context, '5', 'Streak', Icons.local_fire_department),
                  const SizedBox(width: 16),
                  _buildStatCard(context, '12', 'Courses', Icons.book),
                ],
              ),
            ),
            const SizedBox(height: 32),
            _buildListTile(
                context, 'My Courses', Icons.collections_bookmark_outlined),
            _buildListTile(context, 'Quiz History', Icons.history),
            _buildListTile(
                context, 'Achievements', Icons.emoji_events_outlined),
            _buildListTile(context, 'Settings', Icons.settings_outlined),
            _buildListTile(context, 'Help & Support', Icons.help_outline),
            const Divider(height: 48),
            _buildListTile(context, 'Logout', Icons.logout, color: Colors.red),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
      BuildContext context, String value, String Label, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.secondary.withOpacity(
              Theme.of(context).brightness == Brightness.dark ? 0.3 : 1.0),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary, size: 24),
            const SizedBox(height: 8),
            Text(value,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text(Label,
                style: TextStyle(
                    fontSize: 10,
                    color: Theme.of(context).textTheme.bodySmall?.color)),
          ],
        ),
      ),
    );
  }

  Widget _buildListTile(BuildContext context, String title, IconData icon,
      {Color? color}) {
    return ListTile(
      leading:
          Icon(icon, color: color ?? Theme.of(context).colorScheme.onSurface),
      title: Text(title,
          style: TextStyle(
              color: color ?? Theme.of(context).colorScheme.onSurface,
              fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.chevron_right, size: 20),
      onTap: () {},
    );
  }
}
