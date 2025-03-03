import 'package:flutter/material.dart';
import 'modifyOutfit.dart'; // Ensure this path is correct

class SuggestionPage extends StatelessWidget {
  const SuggestionPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Column(
            children: [
              const SizedBox(height: 80),
              // "You also may like" section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Material(
                  shape: const RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              // Product list with bottom space
              Expanded(
                child: ListView(
                  scrollDirection: Axis.vertical, // Changed to vertical
                  children: const [
                    ProductCard(
                        image: 'assets/images/image30.png',
                        title: "Puff long frock",
                        price: "RS.4500.00"),
                    ProductCard(
                        image: 'assets/images/image33.png',
                        title: "Cocoon Red Frock",
                        price: "RS.6000.00"),
                    ProductCard(
                        image: 'assets/images/image32.png',
                        title: "Wrap Dress",
                        price: "RS. 6500.00"),
                    ProductCard(
                        image: 'assets/images/image32.png',
                        title: "Wrap Dress",
                        price: "RS. 6500.00"),
                  ],
                ),
              ),
              const SizedBox(height: 16), // Added bottom padding
            ],
          ),
          // Black 3-line menu icon at the top left corner
          Positioned(
            top: 40,
            left: 16,
            child: IconButton(
              icon: const Icon(Icons.menu, color: Colors.black),
              onPressed: () {
                // Handle menu button press
                print("Menu button pressed");
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Product Card with heart icon and navigation to ModifyPage
class ProductCard extends StatelessWidget {
  final String image;
  final String title;
  final String price;

  const ProductCard({
    super.key,
    required this.image,
    required this.title,
    required this.price,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ModifyPage(
              image: image,
              title: title,
            ),
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(
            horizontal: 16, vertical: 8), // Adjusted padding
        child: Container(
          width: double.infinity, // Full width for vertical layout
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(2, 2),
              ),
            ],
            border: Border.all(color: Colors.black, width: 2),
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start, // Align content to the start
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
                child: Image.asset(
                  image,
                  fit: BoxFit.cover,
                  width: double.infinity, // Full width for vertical layout
                  height: 200, // Keeps image height consistent
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Product Title and Price
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: const TextStyle(
                              fontSize: 16, // Increased font size
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            price,
                            style: const TextStyle(
                              fontSize: 14, // Increased font size
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Heart Icon for Favorite
                    IconButton(
                      icon: const Icon(Icons.favorite_border,
                          color: Colors.black),
                      onPressed: () {
                        // Handle favorite action
                        print("Added $title to favorites!");
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
