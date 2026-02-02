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
}
