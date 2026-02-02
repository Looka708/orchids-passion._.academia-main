import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';
import 'package:passion_academia/widgets/common/custom_text_field.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Create Account',
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Join the Elite Consistency club today',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).textTheme.bodySmall?.color,
                  ),
            ),
            const SizedBox(height: 40),
            CustomTextField(
              label: 'Full Name',
              hint: 'John Doe',
              controller: _nameController,
              prefixIcon: const Icon(Icons.person_outline),
            ),
            const SizedBox(height: 20),
            CustomTextField(
              label: 'Email',
              hint: 'student@example.com',
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              prefixIcon: const Icon(Icons.email_outlined),
            ),
            const SizedBox(height: 20),
            CustomTextField(
              label: 'Password',
              hint: '••••••••',
              controller: _passwordController,
              obscureText: _obscurePassword,
              prefixIcon: const Icon(Icons.lock_outlined),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                ),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: context.watch<AuthProvider>().isLoading
                  ? null
                  : _handleSignup,
              child: context.watch<AuthProvider>().isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Create Account'),
            ),
            const SizedBox(height: 24),
            Center(
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Already have an account? Sign In'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleSignup() async {
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.signup(
      _nameController.text.trim(),
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account created! Please sign in.'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Signup failed'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}
