import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';
import 'package:passion_academia/widgets/infinity_loader.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AdminProvider>().fetchUsers());
  }

  @override
  Widget build(BuildContext context) {
    final adminProvider = context.watch<AdminProvider>();

    return adminProvider.isLoading
        ? const Center(child: InfinityLoader(message: 'Fetching Students...'))
        : adminProvider.error != null
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Error: ${adminProvider.error}',
                        style: const TextStyle(color: Colors.red)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () =>
                          context.read<AdminProvider>().fetchUsers(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            : adminProvider.users.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.people_outline,
                            size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text('No users found.',
                            style: TextStyle(fontSize: 18, color: Colors.grey)),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () =>
                              context.read<AdminProvider>().fetchUsers(),
                          child: const Text('Refresh'),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: () => context.read<AdminProvider>().fetchUsers(),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16.0),
                      itemCount: adminProvider.users.length,
                      itemBuilder: (context, index) {
                        final user = adminProvider.users[index];
                        final bool isActive = user['active'] ?? true;

                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15)),
                          child: ListTile(
                            onTap: () => _showUserDetails(context, user),
                            leading: CircleAvatar(
                              backgroundImage: user['photo_url'] != null
                                  ? NetworkImage(user['photo_url'])
                                  : null,
                              child: user['photo_url'] == null
                                  ? const Icon(Icons.person)
                                  : null,
                            ),
                            title: Text(user['full_name'] ?? 'Unknown User'),
                            subtitle: Text(user['email'] ?? ''),
                            trailing: Switch(
                              value: isActive,
                              onChanged: (value) async {
                                final success = await adminProvider
                                    .toggleUserStatus(user['id'], isActive);
                                if (success && mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                          'User account ${value ? "activated" : "deactivated"}'),
                                      backgroundColor:
                                          value ? Colors.green : Colors.red,
                                    ),
                                  );
                                }
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  );
  }

  void _showUserDetails(BuildContext context, Map<String, dynamic> user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundImage: user['photo_url'] != null
                      ? NetworkImage(user['photo_url'])
                      : null,
                  child: user['photo_url'] == null
                      ? const Icon(Icons.person, size: 30)
                      : null,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user['full_name'] ?? 'Unknown',
                        style: const TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      Text(user['email'] ?? '',
                          style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
                Chip(
                  label: Text((user['role'] ?? 'user').toUpperCase()),
                  backgroundColor: Colors.indigo.withOpacity(0.1),
                  labelStyle: const TextStyle(
                      color: Colors.indigo,
                      fontWeight: FontWeight.bold,
                      fontSize: 10),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                _buildInfoTile('XP', '${user['xp'] ?? 0}', Icons.stars),
                const SizedBox(width: 12),
                _buildInfoTile('Streak', '${user['streak'] ?? 0}d',
                    Icons.local_fire_department),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildInfoTile(
                    'Status',
                    user['active'] == false ? 'Inactive' : 'Active',
                    Icons.verified_user_outlined),
                const SizedBox(width: 12),
                _buildInfoTile(
                    'Target', user['course'] ?? 'None', Icons.school),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Close'),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: Colors.indigo),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(fontSize: 10, color: Colors.grey)),
                Text(value,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
