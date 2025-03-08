import 'package:flutter/material.dart';
import 'modifyOutfit.dart'; // Import the ModifyPage

class FavoritePage extends StatelessWidget {
  final Set<ProductCardData> favorites;

  const FavoritePage({super.key, required this.favorites});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Favorites'),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2, // Two cards in a row
          crossAxisSpacing: 16, // Spacing between cards horizontally
          mainAxisSpacing: 16, // Spacing between cards vertically
          childAspectRatio:
              0.6, // Adjust card aspect ratio for full-height images
        ),
        itemCount: favorites.length,
        itemBuilder: (context, index) {
          final product = favorites.elementAt(index);
          return ProductCard(
            image: product.image,
            title: product.title,
            price: product.price,
            isFavorite:
                true, // Since it's the favorites page, all items are favorited
            onFavoritePressed: () {
              // Handle unfavorite action if needed
            },
          );
        },
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
        // Navigate to ModifyPage when the card is tapped
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

class ProductCardData {
  final String image;
  final String title;
  final String price;

  ProductCardData({
    required this.image,
    required this.title,
    required this.price,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProductCardData &&
          runtimeType == other.runtimeType &&
          image == other.image &&
          title == other.title &&
          price == other.price;

  @override
  int get hashCode => image.hashCode ^ title.hashCode ^ price.hashCode;
}
