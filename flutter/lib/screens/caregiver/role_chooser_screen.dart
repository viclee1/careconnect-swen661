import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/routing/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../models/caregiver.dart';
import '../../state/caregiver_controller.dart';
import '../../widgets/responsive.dart';

/// After signing in: who is using CareConnect on this phone right now.
class RoleChooserScreen extends StatelessWidget {
  const RoleChooserScreen({super.key});

  void _choose(BuildContext context, Role role) {
    context.read<CaregiverController>().setRole(role);
    context.go(role == Role.caregiver ? Routes.dashboard : Routes.home);
  }

  @override
  Widget build(BuildContext context) {
    final TextTheme text = Theme.of(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: ReadableWidth(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 48, 16, 24),
            children: <Widget>[
              Semantics(
                header: true,
                child: Text(
                  'Welcome, Margaret',
                  textAlign: TextAlign.center,
                  style: text.headlineSmall?.copyWith(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Who is using CareConnect right now?',
                textAlign: TextAlign.center,
                style: text.bodyLarge?.copyWith(color: AppColors.secondaryDark),
              ),
              const SizedBox(height: 24),
              _Choice(
                icon: Icons.person,
                title: 'I am the care recipient',
                description: 'My day, my medicines, and the people I talk to.',
                onTap: () => _choose(context, Role.patient),
              ),
              const SizedBox(height: 16),
              _Choice(
                icon: Icons.volunteer_activism,
                title: 'I am a caregiver',
                description: 'How the day is going, and the medicines and visits I look after.',
                onTap: () => _choose(context, Role.caregiver),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Choice extends StatelessWidget {
  const _Choice({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final TextTheme text = Theme.of(context).textTheme;
    return Semantics(
      container: true,
      button: true,
      label: '$title. $description',
      excludeSemantics: true,
      child: Material(
        color: AppColors.primaryLight,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppColors.border, width: 2),
          borderRadius: BorderRadius.circular(AppTheme.radius),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppTheme.radius),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: <Widget>[
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.primaryDark,
                  child: Icon(icon, color: AppColors.primaryLight, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(title, style: text.titleMedium?.copyWith(
                        color: AppColors.primaryDark,
                        fontWeight: FontWeight.bold,
                      )),
                      const SizedBox(height: 4),
                      Text(description, style: text.bodyMedium?.copyWith(color: AppColors.secondaryDark)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
