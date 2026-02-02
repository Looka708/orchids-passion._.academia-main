import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';
import 'package:passion_academia/screens/profile/profile_screen.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool showProfile;
  final List<Widget>? actions;
  final bool transparent;

  const AppHeader({
    super.key,
    this.title,
    this.showProfile = true,
    this.actions,
    this.transparent = false,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return AppBar(
      backgroundColor: transparent ? Colors.transparent : null,
      title: title != null
          ? Text(title!, style: const TextStyle(fontWeight: FontWeight.bold))
          : Row(
              children: [
                Icon(Icons.school,
                    color: Theme.of(context).colorScheme.primary, size: 28),
                const SizedBox(width: 8),
                Text(
                  'Passion',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurface,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
      actions: [
        if (actions != null) ...actions!,
        if (showProfile) ...[
          GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (c) => const ProfileScreen()),
              );
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: auth.userProfile?.photoUrl != null
                  ? Image.network(
                      auth.userProfile!.photoUrl!,
                      width: 32,
                      height: 32,
                      fit: BoxFit.cover,
                      errorBuilder: (c, e, s) =>
                          _buildDefaultAvatar(context, auth),
                    )
                  : _buildDefaultAvatar(context, auth),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ],
    );
  }

  Widget _buildDefaultAvatar(BuildContext context, AuthProvider auth) {
    return Container(
      width: 32,
      height: 32,
      color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
      child: Center(
        child: Text(
          auth.userProfile?.name.isNotEmpty == true
              ? auth.userProfile!.name[0].toUpperCase()
              : 'P',
          style: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
