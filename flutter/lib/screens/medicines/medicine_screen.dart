import 'package:flutter/material.dart';

import '../../widgets/app_scaffold.dart';

class MedicineScreen extends StatefulWidget {
  const MedicineScreen({super.key});

  @override
  State<MedicineScreen> createState() => _MedicineScreenState();
}

class _MedicineScreenState extends State<MedicineScreen> {
  final List<Map<String, dynamic>> medications = [
    {'name': 'Aspirin', 'dosage': '81mg', 'time': 'Morning (8:00 AM)', 'taken': false},
    {'name': 'Lisinopril', 'dosage': '10mg', 'time': 'Evening (6:00 PM)', 'taken': true},
  ];

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Medications',
      body: ListView.builder(
        itemCount: medications.length,
        itemBuilder: (context, index) {
          final med = medications[index];
          // CheckboxListTile already exposes the correct "checkbox" role plus
          // its checked state and title/subtitle text to screen readers.
          // Wrapping it in a second Semantics node with a hand-written label
          // used to make TalkBack/VoiceOver announce the medication twice —
          // once from the custom label, once from the tile's own semantics —
          // so the native tile is left to speak for itself.
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: CheckboxListTile(
              title: Text(med['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Dosage: ${med['dosage']}\nTime: ${med['time']}'),
              isThreeLine: true,
              secondary: const Icon(Icons.medication, color: Colors.green),
              value: med['taken'],
              onChanged: (bool? value) {
                setState(() {
                  medications[index]['taken'] = value ?? false;
                });
              },
            ),
          );
        },
      ),
    );
  }
}
