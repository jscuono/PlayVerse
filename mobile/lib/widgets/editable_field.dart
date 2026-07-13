import 'package:flutter/material.dart';

class EditableField extends StatefulWidget {
  final String label;
  final String initialValue;
  final bool obscureText;

  const EditableField({
    super.key,
    required this.label,
    required this.initialValue,
    this.obscureText = false,
  });

  @override
  State<EditableField> createState() => _EditableFieldState();
}

class _EditableFieldState extends State<EditableField> {
  late TextEditingController _controller;
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggleEdit() {
    setState(() {
      _isEditing = !_isEditing;
      // TODO: once a backend exists, save _controller.text here when closing edit mode
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.label,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: _isEditing
                    ? TextField(
                        controller: _controller,
                        obscureText: widget.obscureText,
                        autofocus: true,
                        style: const TextStyle(fontSize: 16),
                        decoration: const InputDecoration(
                          isDense: true,
                          border: UnderlineInputBorder(),
                        ),
                      )
                    : Text(
                        widget.obscureText ? '•' * 12 : _controller.text,
                        style: const TextStyle(fontSize: 16, color: Colors.black87),
                      ),
              ),
              IconButton(
                icon: Icon(
                  _isEditing ? Icons.check : Icons.edit,
                  size: 20,
                  color: Colors.black54,
                ),
                onPressed: _toggleEdit,
              ),
            ],
          ),
        ],
      ),
    );
  }
}