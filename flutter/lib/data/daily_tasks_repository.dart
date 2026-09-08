import 'package:flutter/material.dart';
import '../models/daily_task.dart';

abstract interface class DailyTasksRepository {
  List<DailyTask> getTasks();
  void updateTask(String id, bool isDone);
  bool isNotificationVisible();
  void dismissNotification();
}

class InMemoryDailyTasksRepository implements DailyTasksRepository {
  bool _notificationVisible = true;

  final Map<String, DailyTask> _tasks = {
    '1': DailyTask(
      id: '1',
      title: 'Take Amlodipine',
      subtitle: '5 mg — 1 tablet with food',
      time: '8:30 am',
      icon: Icons.medication,
    ),
    '2': DailyTask(
      id: '2',
      title: 'Morning check-in',
      subtitle: "Tap to confirm you're doing well",
      time: '9:00 am',
      icon: Icons.check_box,
    ),
    '3': DailyTask(
      id: '3',
      title: 'Blood pressure check',
      subtitle: 'Greenfield Surgery — Dr. Sharma',
      time: '10:30 am',
      icon: Icons.monitor_heart,
    ),
    '4': DailyTask(
      id: '4',
      title: 'Take Metformin',
      subtitle: '500 mg — 1 tablet with lunch',
      time: '12:00 pm',
      icon: Icons.medication,
    ),
    '5': DailyTask(
      id: '5',
      title: 'Video call with Maria',
      subtitle: 'Your daughter will call you',
      time: '3:00 pm',
      icon: Icons.video_call,
    ),
    '6': DailyTask(
      id: '6',
      title: 'Take Atorvastatin',
      subtitle: '20 mg — 1 tablet at night',
      time: '8:00 pm',
      icon: Icons.medication,
    ),
    '7': DailyTask(
      id: '7',
      title: 'Evening check-in',
      subtitle: "Tap to confirm you're doing well",
      time: '9:00 pm',
      icon: Icons.check_box,
    ),
  };

  @override
  List<DailyTask> getTasks() => _tasks.values.toList();

  @override
  void updateTask(String id, bool isDone) {
    if (_tasks.containsKey(id)) {
      _tasks[id] = _tasks[id]!.copyWith(isDone: isDone);
    }
  }

  @override
  bool isNotificationVisible() => _notificationVisible;

  @override
  void dismissNotification() {
    _notificationVisible = false;
  }
}
