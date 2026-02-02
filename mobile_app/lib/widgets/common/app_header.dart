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
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.network(
              'https://github.com/shadcn.png',
              width: 32,
              height: 32,
              errorBuilder: (c, e, s) => Container(
                width: 32,
                height: 32,
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                child: Icon(Icons.person,
                    size: 20, color: Theme.of(context).colorScheme.primary),
              ),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
