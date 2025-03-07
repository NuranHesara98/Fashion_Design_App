import 'package:flutter/material.dart';
import 'store.dart';

class ModifyPage extends StatefulWidget {
  final String image;
  final String title;

  const ModifyPage({super.key, required this.image, required this.title});

  @override
  _ModifyPageState createState() => _ModifyPageState();
}

class _ModifyPageState extends State<ModifyPage> {
  String? _selectedSize;
  Color _selectedColor = Colors.black;
  String? _selectedMaterial;

  final List<Map<String, String>> _materials = [
    {'name': 'Velvet', 'image': 'assets/images/velvet.jpg'},
    {'name': 'Cotton', 'image': 'assets/images/cotton.jpg'},
    {'name': 'Wool Knitted', 'image': 'assets/images/woolknitted.jpg'},
    {'name': 'Jacquard', 'image': 'assets/images/jaquard.jpg'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.menu, color: Colors.black),
          onPressed: () {},
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Image.asset(
                widget.image,
                height: 300,
              ),
            ),
            SizedBox(height: 20),
            _buildSizeChart(),
            SizedBox(height: 20),
            _buildColorPicker(),
            SizedBox(height: 20),
            _buildMaterialSelector(),
            SizedBox(height: 20),
            _buildNextButton(), // Added Next Button here
          ],
        ),
      ),
    );
  }

  Widget _buildSizeChart() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Size Chart",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 10),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            columnSpacing: 12,
            border: TableBorder.all(color: Colors.black),
            columns: [
              DataColumn(label: Text("Size")),
              DataColumn(label: Text("Chest (in)")),
              DataColumn(label: Text("Waist (in)")),
              DataColumn(label: Text("Hips (in)")),
              DataColumn(label: Text("Shoulder (in)")),
              DataColumn(label: Text("Inseam (in)")),
              DataColumn(label: Text("Height (ft/in)")),
            ],
            rows: [
              _buildDataRow("XS", "30-32", "24-26", "32-34", "14-15", "30-31",
                  "5'0\"-5'3\""),
              _buildDataRow("S", "33-35", "27-29", "35-37", "15-16", "31-32",
                  "5'2\"-5'5\""),
              _buildDataRow("M", "36-38", "30-32", "38-40", "16-17", "32-33",
                  "5'4\"-5'7\""),
              _buildDataRow("L", "39-41", "33-35", "41-43", "17-18", "33-34",
                  "5'6\"-5'9\""),
              _buildDataRow("XL", "42-44", "36-38", "44-46", "18-19", "34-35",
                  "5'8\"-6'0\""),
              _buildDataRow("XXL", "45-47", "39-41", "47-49", "19-20", "35-36",
                  "5'10\"-6'2\""),
              _buildDataRow("3XL", "48-50", "42-44", "50-52", "20-21", "36-37",
                  "6'0\"-6'4\""),
            ],
          ),
        ),
      ],
    );
  }

  DataRow _buildDataRow(String size, String chest, String waist, String hips,
      String shoulder, String inseam, String height) {
    return DataRow(
      selected: _selectedSize == size,
      onSelectChanged: (selected) {
        if (selected == true) {
          setState(() {
            _selectedSize = size;
          });
        }
      },
      cells: [
        DataCell(Text(size)),
        DataCell(Text(chest)),
        DataCell(Text(waist)),
        DataCell(Text(hips)),
        DataCell(Text(shoulder)),
        DataCell(Text(inseam)),
        DataCell(Text(height)),
      ],
    );
  }

  Widget _buildColorPicker() {
    List<Color> colors = [
      for (int i = 0; i < 50; i++) Colors.primaries[i % Colors.primaries.length]
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Change the colour",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 10),
        Container(
          padding: EdgeInsets.all(8.0),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.black),
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Wrap(
            spacing: 4.0,
            runSpacing: 4.0,
            children: colors.map((color) {
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedColor = color;
                  });
                },
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.rectangle,
                    border: Border.all(
                      color: _selectedColor == color
                          ? Colors.black
                          : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildMaterialSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Select Fabric Texture",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 10),
        GridView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 8.0,
            mainAxisSpacing: 8.0,
            childAspectRatio: 0.8,
          ),
          itemCount: _materials.length,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedMaterial = _materials[index]['image'];
                });
                _showMaterialPopup(
                    _materials[index]['image']!, _materials[index]['name']!);
              },
              child: Column(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: _selectedMaterial == _materials[index]['image']
                              ? Colors.black
                              : Colors.transparent,
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(8.0),
                        image: DecorationImage(
                          image: AssetImage(_materials[index]['image']!),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 5),
                  Text(
                    _materials[index]['name']!,
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  void _showMaterialPopup(String imagePath, String fabricName) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          backgroundColor: const Color.fromARGB(0, 0, 0, 0),
          child: InteractiveViewer(
            panEnabled: true,
            minScale: 1.0,
            maxScale: 4.0,
            child: Image.asset(imagePath, fit: BoxFit.cover),
          ),
        );
      },
    );
  }

  Widget _buildNextButton() {
    return Center(
      child: ElevatedButton(
        onPressed: () {
          // Navigate to ProfilePage when the menu icon is clicked
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const StorePage()),
          );
        },
        style: ElevatedButton.styleFrom(
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(horizontal: 100, vertical: 12),
          backgroundColor: Colors.black,
          textStyle: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold), // Text color set to white
        ),
        child: Text("Next"),
      ),
    );
  }
}
