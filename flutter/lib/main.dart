import 'package:flutter/material.dart';

import 'app.dart';
import 'data/contact_repository.dart';
import 'data/message_repository.dart';
import 'data/settings_repository.dart';

/// Entry point.
///
/// Week 4 runs against in-memory repositories seeded with the same care
/// recipient the React web client uses. Swapping in a networked implementation
/// is a change to these three lines and nothing else.
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    CareConnectApp(
      contactRepository: MockContactRepository(),
      messageRepository: MockMessageRepository(),
      settingsRepository: SharedPreferencesSettingsRepository(),
    ),
  );
}
