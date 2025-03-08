import 'package:flutter/material.dart';

class CustomizePage extends StatefulWidget {
  final String selectedProductImage;

  const CustomizePage({super.key, required this.selectedProductImage});

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
  bool isLoading = false;

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
                ['Budget', 'Mid-level', 'Premium'],
                selectedClothingType,
                (value) => setState(() => selectedClothingType = value),
              ),
              const SizedBox(height: 16),
              _buildRadioGroup(),
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
        onPressed: () {},
      ),
    );
  }

  Widget _buildImageSection() {
    return Center(
      child: Container(
        height: 180, // Reduced height for better fit
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.asset(
            widget.selectedProductImage,
            fit: BoxFit.contain, // Ensures the image fits within the container
          ),
        ),
      ),
    );
  }

  Widget _buildTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildDropdown(String title, List<String> options,
      String? currentValue, ValueChanged<String?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: currentValue,
          decoration: InputDecoration(
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
          items: options
              .map((option) =>
                  DropdownMenuItem(value: option, child: Text(option)))
              .toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildTextInput(
      String title, String hintText, ValueChanged<String> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        TextField(
          decoration: InputDecoration(
            hintText: hintText,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildRadioGroup() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('When will you be wearing this outfit?',
            style: TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        Row(
          children: [
            _buildRadioButton(
                'Day',
                isDaySelected,
                (value) => setState(() {
                      isDaySelected = true;
                      isNightSelected = false;
                    })),
            _buildRadioButton(
                'Night',
                isNightSelected,
                (value) => setState(() {
                      isDaySelected = false;
                      isNightSelected = true;
                    })),
          ],
        ),
      ],
    );
  }

  Widget _buildRadioButton(
      String title, bool value, ValueChanged<bool?> onChanged) {
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
        const Text('Select Your Skin Tone', style: TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        Row(
          children: tones
              .map((color) => GestureDetector(
                    onTap: () => setState(() =>
                        selectedTone = (selectedTone == color) ? null : color),
                    child: Padding(
                      padding: const EdgeInsets.only(right: 10),
                      child: CircleAvatar(radius: 20, backgroundColor: color),
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
          ? const CircularProgressIndicator()
          : ElevatedButton(
              onPressed: () {
                setState(() => isLoading = true);
                Future.delayed(const Duration(seconds: 2), () {
                  setState(() => isLoading = false);
                  Navigator.pushNamed(context, '/suggestion');
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                padding:
                    const EdgeInsets.symmetric(horizontal: 130, vertical: 5),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30)),
              ),
              child: const Text('NEXT',
                  style: TextStyle(fontSize: 16, color: Colors.white)),
            ),
    );
  }
}
