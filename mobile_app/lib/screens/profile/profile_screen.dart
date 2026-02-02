import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';
import 'package:passion_academia/widgets/common/stat_card.dart';
import 'package:passion_academia/screens/auth/welcome_screen.dart';
import 'package:passion_academia/screens/profile/personal_info_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 75,
    );

    if (image != null) {
      final bytes = await image.readAsBytes();
      if (!mounted) return;

      final success =
          await context.read<AuthProvider>().updateProfilePicture(bytes);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success
              ? 'Profile picture updated!'
              : 'Failed to update picture.'),
          backgroundColor: success ? Colors.green : Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 24),
            // Profile Header
            Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: Theme.of(context).colorScheme.primary, width: 2),
                  ),
                ),
                ClipOval(
                  child: authProvider.userProfile?.photoUrl != null
                      ? Image.network(
                          authProvider.userProfile!.photoUrl!,
                          width: 108,
                          height: 108,
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, progress) {
                            if (progress == null) return child;
                            return const SizedBox(
                              width: 108,
                              height: 108,
                              child: Center(child: CircularProgressIndicator()),
                            );
                          },
                        )
                      : Container(
                          width: 108,
                          height: 108,
                          color: Theme.of(context)
                              .colorScheme
                              .primary
                              .withOpacity(0.1),
                          child: Icon(Icons.person,
                              size: 60,
                              color: Theme.of(context).colorScheme.primary),
                        ),
                ),
                if (authProvider.isLoading)
                  const Positioned.fill(
                    child: Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: authProvider.isLoading ? null : _pickImage,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 4,
                          )
                        ],
                      ),
                      child: const Icon(Icons.camera_alt,
                          size: 16, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              authProvider.userName ?? 'Guest Student',
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            Text(
              authProvider.userProfile?.role.toUpperCase() ?? 'MEMBER',
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.bold,
                fontSize: 12,
                letterSpacing: 2,
              ),
            ),

            const SizedBox(height: 32),

            // Gamification Stats
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          value: '${authProvider.userXP}',
                          label: 'Total XP',
                          icon: Icons.stars,
                          color: Colors.amber,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: StatCard(
                          value: '${authProvider.userStreak} Days',
                          label: 'Streak',
                          icon: Icons.local_fire_department,
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const StatCard(
                    value: '4/12',
                    label: 'Courses Completed',
                    icon: Icons.school,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Profile Options
            _buildOptionGroup(context, 'Account', [
              _buildOption(
                context,
                'Personal Info',
                Icons.person_outline,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const PersonalInfoScreen()),
                  );
                },
              ),
              _buildOption(
                  context, 'My Certificates', Icons.card_membership_outlined),
              _buildOption(context, 'Payment Methods', Icons.payment_outlined),
            ]),

            _buildOptionGroup(context, 'Learning', [
              _buildOption(context, 'Favorite Courses', Icons.favorite_border),
              _buildOption(context, 'Quiz History', Icons.history),
              _buildOption(context, 'Download Settings',
                  Icons.download_for_offline_outlined),
            ]),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
              child: Divider(),
            ),

            ListTile(
              onTap: () {
                authProvider.logout();
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (c) => const WelcomeScreen()),
                  (route) => false,
                );
              },
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Logout',
                  style: TextStyle(
                      color: Colors.red, fontWeight: FontWeight.bold)),
              trailing:
                  const Icon(Icons.chevron_right, size: 20, color: Colors.red),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionGroup(
      BuildContext context, String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
          ),
        ),
        ...children,
      ],
    );
  }

  Widget _buildOption(BuildContext context, String label, IconData icon,
      {VoidCallback? onTap}) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24),
      leading: Icon(icon, size: 22),
      title: Text(label),
      trailing: const Icon(Icons.chevron_right, size: 20),
      onTap: onTap,
    );
  }
}
