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

    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
      ),
      body: adminProvider.isLoading
          ? const Center(child: InfinityLoader(message: 'Fetching Students...'))
          : adminProvider.error != null
              ? Center(child: Text('Error: ${adminProvider.error}'))
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ListView.builder(
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
                ),
    );
  }
}
