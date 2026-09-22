import 'package:flutter/material.dart';

import '../../widgets/app_scaffold.dart';

class ApptsScreen extends StatelessWidget {
  const ApptsScreen({super.key});

  final List<Map<String, String>> appointments = const [
    {'doctor': 'Dr. Smith', 'time': '10:00 AM', 'purpose': 'Cardiology Checkup', 'date': 'Tomorrow'},
    {'doctor': 'Dr. Davis', 'time': '2:30 PM', 'purpose': 'General Follow-up', 'date': 'Sep 12, 2026'},
  ];

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Appointments',
      body: ListView.builder(
        itemCount: appointments.length,
        itemBuilder: (context, index) {
          final appt = appointments[index];
          void openDetail() {
            // Action for tapping appointment detail
          }
          return Semantics(
            label: 'Appointment with ${appt['doctor']} on ${appt['date']} at ${appt['time']} for ${appt['purpose']}',
            button: true,
            onTap: openDetail,
            child: ExcludeSemantics(
              child: Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: const Icon(Icons.calendar_today, color: Colors.blue),
                  title: Text(appt['doctor']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${appt['date']} at ${appt['time']}\nPurpose: ${appt['purpose']}'),
                  isThreeLine: true,
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: openDetail,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
