import 'package:flutter/material.dart';

class NavDropdown extends StatelessWidget {
  final bool visible;
  final VoidCallback onClose;

  const NavDropdown({super.key, required this.visible, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final items = [
      {'label': 'Movies', 'icon': Icons.local_movies},
      {'label': 'TV Series', 'icon': Icons.tv},
      {'label': 'Music', 'icon': Icons.music_note},
      {'label': 'Games', 'icon': Icons.sports_esports},
    ];

    return Positioned(
      top: 0,
      left: 0,
      child: Material(
        color: const Color(0xFF7C6FD8),
        borderRadius: const BorderRadius.only(bottomRight: Radius.circular(24)),
        elevation: visible ? 8 : 0,
        child: ClipRect(
          child: AnimatedSize(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            alignment: Alignment.topCenter,
            child: visible
                ? Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: items.map((item) {
                        return InkWell(
                          onTap: () {
                            // TODO: navigate to the relevant category page once it exists
                            onClose();
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
                            child: Row(
                              children: [
                                Icon(item['icon'] as IconData, color: Colors.white),
                                const SizedBox(width: 16),
                                Text(
                                  item['label'] as String,
                                  style: const TextStyle(color: Colors.white, fontSize: 16),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ),
      ),
    );
  }
}