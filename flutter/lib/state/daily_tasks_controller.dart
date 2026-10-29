import 'package:flutter/foundation.dart';
import '../data/daily_tasks_repository.dart';
import '../models/caregiver.dart';
import '../models/daily_task.dart';
import 'caregiver_controller.dart';

class DailyTasksController extends ChangeNotifier {
  DailyTasksController({required DailyTasksRepository repository, ActivityRecorder? record})
      : _repository = repository,
        _record = record;

  final DailyTasksRepository _repository;
  final ActivityRecorder? _record;

  List<DailyTask> get tasks => _repository.getTasks();

  int get doneCount => tasks.where((t) => t.isDone).length;
  int get totalCount => tasks.length;
  double get progress => totalCount == 0 ? 0 : doneCount / totalCount;

  bool get showNotification => _repository.isNotificationVisible();

  void toggleTask(String id) {
    final task = tasks.firstWhere((t) => t.id == id);
    _repository.updateTask(id, !task.isDone);
    // Finishing something is news for the caregiver; un-ticking a slip is not.
    if (!task.isDone) {
      final event = activityForTask(task);
      _record?.call(event.kind, event.label);
    }
    notifyListeners();
  }

  void dismissNotification() {
    _repository.dismissNotification();
    notifyListeners();
  }
}
