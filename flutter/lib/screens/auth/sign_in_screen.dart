import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/routing/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});
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
              Text('Welcome back', style: textTheme.headlineSmall, textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text('Sign in to your account.', style: textTheme.bodyLarge, textAlign: TextAlign.center),
              const SizedBox(height: 48),
              Text('Email address', style: textTheme.labelLarge),
              const SizedBox(height: 8),
              TextField(decoration: InputDecoration(hintText: 'e.g. alex@example.com', border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radius)), contentPadding: const EdgeInsets.all(16)), keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 24),
              Text('Password', style: textTheme.labelLarge),
              const SizedBox(height: 8),
              TextField(decoration: InputDecoration(hintText: 'Enter your password', border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radius)), contentPadding: const EdgeInsets.all(16)), obscureText: true),
              const SizedBox(height: 12),
              Align(alignment: Alignment.centerRight, child: TextButton(onPressed: () {}, child: Text('Forgot password?', style: textTheme.bodyMedium?.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.bold)))),
              const SizedBox(height: 32),
              FilledButton(onPressed: () => context.go(Routes.home), style: FilledButton.styleFrom(backgroundColor: AppColors.primaryDark, foregroundColor: Colors.white, minimumSize: const Size.fromHeight(56), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radius))), child: const Text('Sign in', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
              const SizedBox(height: 24),
              Wrap(alignment: WrapAlignment.center, crossAxisAlignment: WrapCrossAlignment.center, children: [
                const Text('New here? '),
                TextButton(onPressed: () => context.go(Routes.signUp), style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap), child: Text('Create an account', style: textTheme.bodyMedium?.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.bold))),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
