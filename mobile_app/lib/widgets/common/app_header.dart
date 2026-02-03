import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';
import 'package:passion_academia/core/providers/notification_provider.dart';
import 'package:passion_academia/screens/profile/profile_screen.dart';
import 'package:passion_academia/screens/notification/notification_screen.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool showProfile;
  final List<Widget>? actions;
  final bool transparent;
  final VoidCallback? onSearch;

  const AppHeader({
    super.key,
    this.title,
    this.showProfile = true,
    this.actions,
    this.transparent = false,
    this.onSearch,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return AppBar(
      backgroundColor: transparent ? Colors.transparent : null,
      elevation: transparent ? 0 : null,
      title: title != null
          ? Text(title!,
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ))
          : Row(
              children: [
                Image.asset(
                  'assets/images/logo.png',
                  width: 28,
                  height: 28,
                ),
                const SizedBox(width: 8),
                Text(
                  'Passion',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurface,
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
      actions: [
        if (onSearch != null)
          IconButton(
            onPressed: onSearch,
            icon: const Icon(Icons.search),
            splashRadius: 24,
          ),
        Consumer<NotificationProvider>(
          builder: (context, provider, _) => Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (c) => const NotificationScreen()),
                  );
                },
                icon: const Icon(Icons.notifications_outlined),
                splashRadius: 24,
              ),
              if (provider.unreadCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Theme.of(context).scaffoldBackgroundColor,
                        width: 2,
                      ),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '${provider.unreadCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
        ),
        if (actions != null) ...actions!,
        if (showProfile) ...[
          const SizedBox(width: 8),
          GestureDetector(
// ...
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
