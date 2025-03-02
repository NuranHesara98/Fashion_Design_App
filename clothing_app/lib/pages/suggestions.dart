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
                  scrollDirection: Axis.horizontal,
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
              const SizedBox(height: 350),
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
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Container(
          width: 140,
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
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
                child: Image.asset(
                  image,
                  fit: BoxFit.cover,
                  width: 140,
                  height: 200, // Keeps image height consistent
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                color: Colors.white,
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
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            price,
                            style: const TextStyle(
                              fontSize: 12,
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
