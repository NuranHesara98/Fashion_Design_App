import 'package:flutter/material.dart';
import 'package:clothing_app/pages/customizing.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final List<String> categories = [
    "All",
    "Short frock",
    "Long frock",
    "Tops",
    "Skirts",
    "Lehengas"
  ];

  final List<Map<String, String>> products = [
    {"image": "assets/images/Sketch1.jpeg", "category": "Long frock"},
    {"image": "assets/images/Sketch3.jpeg", "category": "Tops"},
    {"image": "assets/images/Sketch4.jpeg", "category": "Long frock"},
    {"image": "assets/images/Sketch6.jpeg", "category": "Long frock"},
    {"image": "assets/images/Sketch7.jpeg", "category": "Long frock"},
    {"image": "assets/images/Sketch9.jpeg", "category": "Tops"},
    {"image": "assets/images/Sketch2.jpeg", "category": "Short frock"},
    {"image": "assets/images/Sketch5.jpeg", "category": "Long frock"},
    {"image": "assets/images/Sketch8.jpeg", "category": "Tops"},
    {"image": "assets/images/Sketch9.jpeg", "category": "Tops"},
    {"image": "assets/images/Sketch10.jpeg", "category": "Tops"},
    {"image": "assets/images/Sketch11.jpeg", "category": "Long frock"},
    {"image": "assets/images/Sketch12.jpeg", "category": "Tops"},
    {"image": "assets/images/Sketch13.jpeg", "category": "Tops"},
    {"image": "assets/images/Sketch14.jpeg", "category": "Skirts"},
    {"image": "assets/images/Sketch15.jpeg", "category": "Skirts"},
  ];

  String selectedCategory = "All";
  TextEditingController searchController = TextEditingController();
  String searchQuery = "";

  @override
  Widget build(BuildContext context) {
    // Filter products based on selected category and search query.
    final filteredProducts = products.where((product) {
      final matchesCategory =
          selectedCategory == "All" || product['category'] == selectedCategory;
      final matchesSearch = product['category']!
          .toLowerCase()
          .contains(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    // Calculate the required height for the grid.
    // Assume a fixed horizontal padding of 16 on each side (total 32) and 8 spacing between columns.
    final screenWidth = MediaQuery.of(context).size.width;
    final totalHorizontalPadding = 32.0;
    final crossAxisSpacing = 8.0;
    final crossAxisCount = 2;
    final cellWidth =
        (screenWidth - totalHorizontalPadding - crossAxisSpacing) /
            crossAxisCount;
    // With a childAspectRatio of 0.75, cellHeight = cellWidth / 0.75.
    final cellHeight = cellWidth / 0.75;
    final rowCount = (filteredProducts.length / crossAxisCount).ceil();
    // Also add spacing between rows (rowCount - 1 times 8.0).
    final gridHeight = rowCount * cellHeight + (rowCount - 1) * 8.0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.black),
          onPressed: () {
            // Handle menu button press
          },
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Bar
              Container(
                margin: const EdgeInsets.symmetric(vertical: 10),
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color.fromARGB(255, 238, 238, 238),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(
                    color: Colors.black,
                    width: 1,
                  ),
                ),
                child: TextField(
                  controller: searchController,
                  decoration: const InputDecoration(
                    hintText: "Search...",
                    border: InputBorder.none,
                    icon: Icon(Icons.search, color: Colors.black),
                  ),
                  onChanged: (value) {
                    setState(() {
                      searchQuery = value;
                    });
                  },
                ),
              ),

              const SizedBox(height: 20),

              // Banner Image
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16.0),
                ),
                child: Stack(
                  children: [
                    Image.asset(
                      'assets/images/image36.jpg',
                      fit: BoxFit.cover,
                      alignment: const Alignment(0, -0.5),
                      width: MediaQuery.of(context).size.width,
                      height: 400,
                    ),
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.5),
                              blurRadius: 8,
                              offset: const Offset(2, 2),
                            ),
                          ],
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'D E S I G N   Y O U R\n O W N   W E A R',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 8.0),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24.0),

              // Categories Row
              const Text(
                "Categories",
                style: TextStyle(
                  fontSize: 20.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16.0),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: categories.map((category) {
                    final isSelected = category == selectedCategory;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedCategory = category;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16.0, vertical: 8.0),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color.fromARGB(255, 0, 0, 0)
                                : Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                          child: Text(
                            category,
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.black,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 16.0),

              // Wrap the GridView.builder in a Container with explicit height
              SizedBox(
                height: gridHeight,
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredProducts.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 8.0,
                    mainAxisSpacing: 8.0,
                    childAspectRatio: 0.75,
                  ),
                  itemBuilder: (context, index) {
                    final product = filteredProducts[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => CustomizePage(
                              selectedProductImage: product['image']!,
                            ),
                          ),
                        );
                      },
                      child: _buildProductCard(product['image']!),
                    );
                  },
                ),
              ),

              const SizedBox(height: 16.0),

              // Suggest Sketch Button
              Padding(
                padding: const EdgeInsets.only(bottom: 20.0),
                child: Center(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => CustomizePage(
                            selectedProductImage: '',
                          ),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                        side: const BorderSide(color: Colors.black, width: 2),
                      ),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 32.0, vertical: 10.0),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Text(
                          "Let me suggest a sketch",
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 16.0,
                          ),
                        ),
                        SizedBox(width: 8.0),
                        Icon(
                          Icons.arrow_forward,
                          color: Colors.black,
                          size: 18.0,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProductCard(String imagePath) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16.0),
        color: Colors.white,
        border: Border.all(
          color: Colors.black,
          width: 2.0,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12.0),
          child: SizedBox(
            height: 120, // Adjust this height as needed
            child: Image.asset(
              imagePath,
              fit: BoxFit.contain,
            ),
          ),
        ),
      ),
    );
  }
}
