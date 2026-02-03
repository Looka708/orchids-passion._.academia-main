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
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AdminProvider>().fetchUsers());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final adminProvider = context.watch<AdminProvider>();

    final filteredUsers = adminProvider.users.where((user) {
      final name = (user['full_name'] ?? '').toString().toLowerCase();
      final email = (user['email'] ?? '').toString().toLowerCase();
      final query = _searchQuery.toLowerCase();
      return name.contains(query) || email.contains(query);
    }).toList();

    return Column(
      children: [
        _buildSearchBar(),
        Expanded(
          child: adminProvider.isLoading
              ? const Center(
                  child: InfinityLoader(message: 'Fetching Students...'))
              : adminProvider.error != null
                  ? _buildErrorState(adminProvider)
                  : filteredUsers.isEmpty
                      ? _buildEmptyState(adminProvider)
                      : _buildUserList(filteredUsers, adminProvider),
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: TextField(
        controller: _searchController,
        onChanged: (v) => setState(() => _searchQuery = v),
        decoration: InputDecoration(
          hintText: 'Search students by name or email...',
          prefixIcon:
              const Icon(Icons.search_rounded, color: Color(0xFF64748B)),
          filled: true,
          fillColor: const Color(0xFFF1F5F9),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
        ),
      ),
    );
  }

  Widget _buildErrorState(AdminProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline_rounded, color: Colors.red, size: 48),
          const SizedBox(height: 16),
          Text('Error: ${provider.error}',
              style: const TextStyle(color: Color(0xFF64748B))),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => provider.fetchUsers(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(AdminProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.people_outline, size: 64, color: Color(0xFFCBD5E1)),
          const SizedBox(height: 16),
          Text(_searchQuery.isEmpty ? 'No users found' : 'No matches found',
              style: const TextStyle(
                  fontSize: 16,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          if (_searchQuery.isEmpty)
            ElevatedButton(
              onPressed: () => provider.fetchUsers(),
              child: const Text('Refresh'),
            ),
        ],
      ),
    );
  }

  Widget _buildUserList(List<dynamic> users, AdminProvider provider) {
    return RefreshIndicator(
      onRefresh: () => provider.fetchUsers(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: users.length,
        itemBuilder: (context, index) {
          final user = users[index];
          final bool isActive = user['active'] ?? true;
          final role = user['role'] ?? 'user';

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              onTap: () => _showUserDetails(context, user),
              leading: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFF1F5F9),
                  image: user['photo_url'] != null
                      ? DecorationImage(
                          image: NetworkImage(user['photo_url']),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: user['photo_url'] == null
                    ? const Icon(Icons.person_rounded, color: Color(0xFF94A3B8))
                    : null,
              ),
              title: Row(
                children: [
                  Expanded(
                    child: Text(
                      user['full_name'] ?? 'Unknown User',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: Color(0xFF0F172A),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (role == 'admin' || role == 'owner')
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF2FF),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        role.toUpperCase(),
                        style: const TextStyle(
                          color: Color(0xFF4F46E5),
                          fontSize: 8,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                ],
              ),
              subtitle: Text(
                user['email'] ?? '',
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF64748B),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              trailing: Transform.scale(
                scale: 0.8,
                child: Switch(
                  value: isActive,
                  activeColor: const Color(0xFF10B981),
                  onChanged: (value) async {
                    final success =
                        await provider.toggleUserStatus(user['id'], isActive);
                    if (success && mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                              'Account ${value ? "activated" : "deactivated"}'),
                          behavior: SnackBarBehavior.floating,
                          backgroundColor: value
                              ? const Color(0xFF059669)
                              : const Color(0xFFDC2626),
                        ),
                      );
                    }
                  },
                ),
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
      backgroundColor: Colors.transparent,
      builder: (context) => _UserDetailsSheet(user: user),
    );
  }
}

class _UserDetailsSheet extends StatefulWidget {
  final Map<String, dynamic> user;
  const _UserDetailsSheet({required this.user});

  @override
  State<_UserDetailsSheet> createState() => _UserDetailsSheetState();
}

class _UserDetailsSheetState extends State<_UserDetailsSheet> {
  @override
  void dispose() {
    // Ensuring any future controllers or listeners are cleaned up here
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.user;
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
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
              _buildInfoTile('Target', user['course'] ?? 'None', Icons.school),
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
    );
  }

  Widget _buildInfoTile(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, size: 16, color: const Color(0xFF4F46E5)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          fontSize: 9,
                          color: Color(0xFF64748B),
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5)),
                  Text(value,
                      style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                          color: Color(0xFF0F172A),
                          overflow: TextOverflow.ellipsis)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
