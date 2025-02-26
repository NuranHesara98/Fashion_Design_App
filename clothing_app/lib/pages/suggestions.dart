import 'package:clothing_app/pages/store.dart';
import 'package:flutter/material.dart';

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

// Product Card with navigation to ProductDetailPage
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
            builder: (context) => ProductDetailPage(
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
          height: 140,
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
                  height: 200,
                  width: 140,
                ),
              ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(8),
                  color: Colors.white,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
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
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProductDetailPage extends StatelessWidget {
  final String image;
  final String title;

  const ProductDetailPage({
    super.key,
    required this.image,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Fullscreen product image
          Image.asset(
            'assets/images/image15.jpg',
            fit: BoxFit.cover,
            height: double.infinity,
            width: double.infinity,
          ),
          // Product Details Card
          Positioned(
            bottom: 20,
            left: 16,
            right: 16,
            child: Container(
              height: 220,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Small preview image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.asset(
                      image,
                      height: 150,
                      width: 100,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Product Title and Description
                  Expanded(
                    child: Padding(
                      padding:
                          const EdgeInsets.only(top: 20), // Adjusted padding
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 20), // Increased spacing
                          const Text(
                            "One button neck along long-sleeved waist female stitching dress",
                            style: TextStyle(fontSize: 13),
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Place Order Button
          Positioned(
            bottom: 40,
            right: 42,
            child: GestureDetector(
              onTap: () {
                // Navigate to StorePage
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const StorePage(),
                  ),
                );
              },
              child: const Text(
                "Place Order",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color.fromARGB(255, 0, 0, 0),
                ),
              ),
            ),
          ),
          // Back Button
          Positioned(
            top: 40,
            left: 16,
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.black),
              onPressed: () => Navigator.pop(context),
            ),
          ),
        ],
      ),
    );
  }
}
