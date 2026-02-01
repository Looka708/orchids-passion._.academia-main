import 'package:flutter/material.dart';

class CustomTextField extends StatelessWidget {
  final String label;
  final String? hint;
  final TextInputType keyboardType;
  final bool obscureText;
  final FormFieldValidator<String>? validator;
  final TextEditingController? controller;
  final Widget? prefixIcon;
  final Widget? suffixIcon;

  const CustomTextField({
    super.key,
    required this.label,
    this.hint,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.validator,
    this.controller,
    this.prefixIcon,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon,
            hintStyle: TextStyle(
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3),
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}
