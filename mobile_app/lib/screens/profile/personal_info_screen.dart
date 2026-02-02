import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';
import 'package:passion_academia/widgets/common/custom_text_field.dart';

class PersonalInfoScreen extends StatefulWidget {
  const PersonalInfoScreen({super.key});

  @override
  State<PersonalInfoScreen> createState() => _PersonalInfoScreenState();
}

class _PersonalInfoScreenState extends State<PersonalInfoScreen> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _courseController;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().userProfile;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _courseController = TextEditingController(text: user?.course ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _courseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Personal Info'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Profile Details',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Your personal information and account settings.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            CustomTextField(
              label: 'Full Name',
              controller: _nameController,
              prefixIcon: const Icon(Icons.person_outline),
              readOnly: true, // For now, maybe implement update later
            ),
            const SizedBox(height: 20),
            CustomTextField(
              label: 'Email Address',
              controller: _emailController,
              prefixIcon: const Icon(Icons.email_outlined),
              readOnly: true,
            ),
            const SizedBox(height: 20),
            CustomTextField(
              label: 'Enrolled Course',
              controller: _courseController,
              prefixIcon: const Icon(Icons.school_outlined),
              readOnly: true,
            ),
            const SizedBox(height: 40),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'To change your personal information, please contact the administration or update it via the web portal.',
                      style: TextStyle(fontSize: 13, color: Colors.blue),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
