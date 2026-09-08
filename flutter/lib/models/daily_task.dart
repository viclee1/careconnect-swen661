import 'package:flutter/widgets.dart';

class DailyTask {
  DailyTask({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.time,
    required this.icon,
    this.isDone = false,
  });

  final String id;
  final String title;
  final String subtitle;
  final String time;
  final IconData icon;
  final bool isDone;

  DailyTask copyWith({bool? isDone}) {
    return DailyTask(
      id: id,
      title: title,
      subtitle: subtitle,
      time: time,
      icon: icon,
      isDone: isDone ?? this.isDone,
    );
  }
}
