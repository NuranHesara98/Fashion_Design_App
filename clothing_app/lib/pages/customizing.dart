import 'package:flutter/material.dart';

class CustomizePage extends StatefulWidget {
  const CustomizePage({super.key});

  @override
  State<CustomizePage> createState() => _CustomizePageState();
}

class _CustomizePageState extends State<CustomizePage> {
  bool isDaySelected = false;
  bool isNightSelected = false;
  String? selectedPurpose;
  String? selectedMaterial;
  String? occasion;
  String? selectedClothingType;
  Color? selectedTone;
  bool isLoading = false; // Added missing variable

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildImageSection(),
              const SizedBox(height: 16),
              _buildTitle('My Style Profile'),
              const SizedBox(height: 16),
              _buildDropdown(
                'What is the primary purpose of this outfit?',
                ['Casual', 'Formal'],
                selectedPurpose,
                (value) => setState(() => selectedPurpose = value),
              ),
              const SizedBox(height: 16),
              _buildTextInput(
                'Which occasion is this outfit for?',
                'Enter occasion',
                (value) => setState(() => occasion = value),
              ),
              const SizedBox(height: 16),
              _buildDropdown(
                'What is your budget range?',
                ['Budget', 'mid-level', 'Premium'],
                selectedClothingType,
                (value) => setState(() => selectedClothingType = value),
              ),
              const SizedBox(height: 16),
              _buildRadioGroup(
                'When will you be wearing this outfit?',
                ['Day', 'Night'],
                isDaySelected,
                isNightSelected,
                (isDay) => setState(() {
                  isDaySelected = isDay;
                  isNightSelected = !isDay;
                }),
              ),
              const SizedBox(height: 16),
              _buildSkinToneSelector(),
              const SizedBox(height: 32),
              _buildNextButton(),
            ],
          ),
        ),
      ),
    );
  }

  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.menu, color: Colors.black),
        onPressed: () {
          // Handle menu button press
        },
      ),
    );
  }

  Widget _buildImageSection() {
    return Center(
      child: Container(
        height: 250,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: Text(
            'SWEETHEART NECKLINE',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildDropdown(
    String title,
    List<String> options,
    String? currentValue,
    ValueChanged<String?> onChanged,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: currentValue,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          items: options.map((option) {
            return DropdownMenuItem(value: option, child: Text(option));
          }).toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildTextInput(
    String title,
    String hintText,
    ValueChanged<String> onChanged,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        TextField(
          decoration: InputDecoration(
            hintText: hintText,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildRadioGroup(
    String title,
    List<String> options,
    bool isDay,
    bool isNight,
    ValueChanged<bool> onSelected,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        Row(
          children: options.map((option) {
            final bool isSelected = option == 'Day' ? isDay : isNight;
            return _buildRadioButton(
              option,
              isSelected,
              (value) => onSelected(option == 'Day'),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildRadioButton(
    String title,
    bool value,
    ValueChanged<bool?> onChanged,
  ) {
    return Row(
      children: [
        Radio<bool>(
          value: true,
          groupValue: value ? true : null,
          onChanged: onChanged,
          activeColor: Colors.black,
        ),
        Text(title),
      ],
    );
  }

  Widget _buildSkinToneSelector() {
    final tones = [
      Colors.brown[300],
      Colors.brown[400],
      Colors.brown[500],
      Colors.brown[600],
      Colors.brown[800],
      Colors.brown[900],
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Select Your Skin Tone',
          style: TextStyle(fontSize: 16),
        ),
        const SizedBox(height: 8),
        Row(
          children: tones
              .map((color) => GestureDetector(
                    onTap: () {
                      setState(() {
                        selectedTone = (selectedTone == color) ? null : color;
                      });
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(right: 10),
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: selectedTone == color
                                ? Colors.black
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: CircleAvatar(
                          radius: 20,
                          backgroundColor: color,
                        ),
                      ),
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }

  Widget _buildNextButton() {
    return Center(
      child: isLoading
          ? const CircularProgressIndicator() // Show loading icon
          : ElevatedButton(
              onPressed: () {
                setState(() {
                  isLoading = true; // Start loading
                });

                Future.delayed(const Duration(seconds: 2), () {
                  setState(() {
                    isLoading = false; // Stop loading
                  });
                  Navigator.pushNamed(context, '/suggestion'); // Navigate
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                padding:
                    const EdgeInsets.symmetric(horizontal: 130, vertical: 5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
              child: const Text('NEXT',
                  style: TextStyle(fontSize: 16, color: Colors.white)),
            ),
    );
  }
}
