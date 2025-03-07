import 'package:flutter/material.dart';
import 'menu.dart'; // Import the ProfilePage
import 'favorite.dart'; // Import the FavoritePage
import 'modifyOutfit.dart'; // Ensure this path is correct

class SuggestionPage extends StatefulWidget {
  const SuggestionPage({super.key});

  @override
  _SuggestionPageState createState() => _SuggestionPageState();
}

class _SuggestionPageState extends State<SuggestionPage> {
  // Set to store favorited items
  final Set<ProductCardData> _favorites = {};

  // List of products
  final List<ProductCardData> _products = [
    ProductCardData(
        image: 'assets/images/image30.png',
        title: "Puff long frock",
        price: "RS.4500.00"),
    ProductCardData(
        image: 'assets/images/image33.png',
        title: "Cocoon Red Frock",
        price: "RS.6000.00"),
    ProductCardData(
        image: 'assets/images/image32.png',
        title: "Wrap Dress",
        price: "RS. 6500.00"),
    ProductCardData(
        image: 'assets/images/image32.png',
        title: "Wrap Dress",
        price: "RS. 6500.00"),
  ];

  // Function to toggle favorite status
  void _toggleFavorite(ProductCardData product) {
    setState(() {
      if (_favorites.contains(product)) {
        _favorites.remove(product); // Remove from favorites
      } else {
        _favorites.add(product); // Add to favorites
      }
    });
  }

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
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, // Two cards in a row
                    crossAxisSpacing: 16, // Spacing between cards horizontally
                    mainAxisSpacing: 16, // Spacing between cards vertically
                    childAspectRatio:
                        0.6, // Adjust card aspect ratio for full-height images
                  ),
                  itemCount: _products.length,
                  itemBuilder: (context, index) {
                    final product = _products[index];
                    return ProductCard(
                      image: product.image,
                      title: product.title,
                      price: product.price,
                      isFavorite: _favorites.contains(product),
                      onFavoritePressed: () => _toggleFavorite(product),
                    );
                  },
                ),
              ),
            ],
          ),
          // Black 3-line menu icon at the top left corner
          Positioned(
            top: 40,
            left: 16,
            child: IconButton(
              icon: const Icon(Icons.menu, color: Colors.black),
              onPressed: () {
                // Navigate to the ProfilePage with favorites
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ProfilePage(favorites: _favorites),
                  ),
                );
              },
            ),
          ),
          // Favorite button at the top right corner
          Positioned(
            top: 40,
            right: 16,
            child: IconButton(
              icon: const Icon(Icons.favorite, color: Colors.red),
              onPressed: () {
                // Navigate to the favorite page
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => FavoritePage(favorites: _favorites),
                  ),
                );
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
  final bool isFavorite;
  final VoidCallback onFavoritePressed;

  const ProductCard({
    super.key,
    required this.image,
    required this.title,
    required this.price,
    required this.isFavorite,
    required this.onFavoritePressed,
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
      child: Container(
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
                child: Image.asset(
                  image,
                  fit: BoxFit.contain, // Ensure the full image is visible
                  width: double.infinity,
                ),
              ),
            ),
            // Details Section
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    price,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            // Heart Icon for Favorite
            Align(
              alignment: Alignment.bottomRight,
              child: IconButton(
                icon: Icon(
                  isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: isFavorite ? Colors.red : Colors.black,
                ),
                onPressed: onFavoritePressed,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
