import 'package:flutter/foundation.dart';
import '../data/daily_tasks_repository.dart';
import '../models/daily_task.dart';

class DailyTasksController extends ChangeNotifier {
  DailyTasksController({required DailyTasksRepository repository})
      : _repository = repository;

  final DailyTasksRepository _repository;

  List<DailyTask> get tasks => _repository.getTasks();

  int get doneCount => tasks.where((t) => t.isDone).length;
  int get totalCount => tasks.length;
  double get progress => totalCount == 0 ? 0 : doneCount / totalCount;

  bool get showNotification => _repository.isNotificationVisible();

  void toggleTask(String id) {
    final task = tasks.firstWhere((t) => t.id == id);
    _repository.updateTask(id, !task.isDone);
    notifyListeners();
  }

  void dismissNotification() {
    _repository.dismissNotification();
    notifyListeners();
  }
}
