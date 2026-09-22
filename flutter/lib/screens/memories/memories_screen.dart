import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../widgets/app_scaffold.dart';

class MemoriesScreen extends StatelessWidget {
  const MemoriesScreen({super.key});

  final List<Map<String, String>> memories = const [
    {'title': 'Family Picnic', 'date': 'July 4, 2026', 'description': 'Enjoying the park with family and loved ones.'},
    {'title': 'Birthday Celebration', 'date': 'August 15, 2026', 'description': 'Celebrating Idris’s milestone birthday party.'},
  ];

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Memories',
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 0.8,
        ),
        itemCount: memories.length,
        itemBuilder: (context, index) {
          final memory = memories[index];
          void openDetail() {
            // Detail view action
          }
          return Semantics(
            label: 'Memory item: ${memory['title']}, dated ${memory['date']}. Description: ${memory['description']}',
            button: true,
            onTap: openDetail,
            child: ExcludeSemantics(
              child: InkWell(
                onTap: openDetail,
                child: Card(
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Container(
                            color: Colors.grey[300],
                            child: const Center(child: Icon(Icons.image, size: 40, color: Colors.grey)),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(memory['title']!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 4),
                        // Colors.grey[600] measures 4.07:1 on white and fails
                        // 4.5:1; the app's own secondaryDark token is 5.11:1.
                        Text(memory['date']!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppColors.secondaryDark, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
