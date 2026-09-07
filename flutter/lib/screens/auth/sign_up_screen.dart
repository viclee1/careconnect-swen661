import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/routing/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';

class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final TextTheme textTheme = Theme.of(context).textTheme;
    return Scaffold(
      backgroundColor: AppColors.primaryLight,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.gutter),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.favorite, color: AppColors.primaryDark, size: 28),
                  const SizedBox(width: 8),
                  Text('CareConnect', style: textTheme.titleLarge?.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 48),
              Text('Create your account', style: textTheme.headlineSmall, textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text('Free, private, and takes under two minutes.', style: textTheme.bodyLarge, textAlign: TextAlign.center),
              const SizedBox(height: 48),
              Text('Your name *', style: textTheme.labelLarge),
              const SizedBox(height: 4),
              Text('This is how CareConnect will greet you.', style: textTheme.bodySmall),
              const SizedBox(height: 8),
              TextField(decoration: InputDecoration(hintText: 'e.g. Alex Johnson', border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radius)), contentPadding: const EdgeInsets.all(16))),
              const SizedBox(height: 24),
              Text('Email address *', style: textTheme.labelLarge),
              const SizedBox(height: 8),
              TextField(decoration: InputDecoration(hintText: 'e.g. alex@example.com', border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radius)), contentPadding: const EdgeInsets.all(16)), keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 24),
              Text('Password *', style: textTheme.labelLarge),
              const SizedBox(height: 4),
              Text('At least 6 characters.', style: textTheme.bodySmall),
              const SizedBox(height: 8),
              TextField(decoration: InputDecoration(hintText: 'Create a password', border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radius)), contentPadding: const EdgeInsets.all(16)), obscureText: true),
              const SizedBox(height: 24),
              Text('Confirm password *', style: textTheme.labelLarge),
              const SizedBox(height: 8),
              TextField(decoration: InputDecoration(hintText: 'Re-enter your password', border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radius)), contentPadding: const EdgeInsets.all(16)), obscureText: true),
              const SizedBox(height: 32),
              FilledButton(onPressed: () => context.go(Routes.home), style: FilledButton.styleFrom(backgroundColor: AppColors.primaryDark, foregroundColor: Colors.white, minimumSize: const Size.fromHeight(56), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radius))), child: const Text('Create account', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
              const SizedBox(height: 24),
              Wrap(alignment: WrapAlignment.center, crossAxisAlignment: WrapCrossAlignment.center, children: [
                const Text('Already have an account? '),
                TextButton(onPressed: () => context.go(Routes.signIn), style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap), child: Text('Sign in', style: textTheme.bodyMedium?.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.bold))),
              ]),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
