import 'package:flutter/material.dart';

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
    return AppBar(
      backgroundColor: transparent ? Colors.transparent : null,
      title: title != null
          ? Text(title!, style: const TextStyle(fontWeight: FontWeight.bold))
          : Row(
              children: [
                Image.asset('assets/images/logo.png',
                    height: 32,
                    errorBuilder: (c, e, s) =>
                        const Icon(Icons.school, color: Colors.green)),
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
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none),
          ),
          const CircleAvatar(
            radius: 16,
            backgroundImage:
                NetworkImage('https://github.com/shadcn.png'), // Placeholder
          ),
          const SizedBox(width: 16),
        ],
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
