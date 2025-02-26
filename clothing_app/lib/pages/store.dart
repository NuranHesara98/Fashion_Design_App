import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'finalProduct.dart';
import 'package:flutter/widgets.dart'; // Add this import to use Navigator

class StorePage extends StatelessWidget {
  const StorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 25),
              Center(
                child: Lottie.asset(
                  'assets/animations/Animation15.json',
                  height: 200,
                ),
              ),
              const SizedBox(height: 20.0),
              RichText(
                text: const TextSpan(
                  children: [
                    TextSpan(
                      text: 'W E L C O M E',
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.bold,
                        color: Color.fromARGB(255, 2, 86, 151),
                      ),
                    ),
                    TextSpan(
                      text: '   to the Store Collection',
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
                textAlign: TextAlign.left,
              ),
              const SizedBox(height: 20),
              _ToggleStoreBox(
                title: 'Urban Vogue',
                description:
                    'Experience the perfect blend of modern fashion and expert craftsmanship at our tailor shop. We specialize in creating custom-made garments that are stylish, comfortable, and fit like a dream.',
                color: const Color.fromARGB(255, 28, 28, 28),
                location: 'Colombo 07, Sri Lanka',
                contactNumber: '+94 71 234 5678',
              ),
              const SizedBox(height: 16),
              _ToggleStoreBox(
                title: 'StyleAura',
                description:
                    'For those who appreciate timeless elegance, our tailor shop is dedicated to creating refined, sophisticated clothing. We focus on clean designs, high-quality fabrics, and expert tailoring to give you a polished look for any occasion.',
                color: const Color.fromARGB(255, 28, 28, 28),
                location: 'Galle Road, Matara',
                contactNumber: '+94 77 987 6543',
              ),
              const SizedBox(height: 16),
              _ToggleStoreBox(
                title: 'ForYou Store',
                description:
                    'Our bespoke tailoring services allow you to personalize your outfit from fabric selection to finishing details, ensuring it’s truly one of a kind.',
                color: const Color.fromARGB(255, 28, 28, 28),
                location: 'Kandy City Center, Kandy',
                contactNumber: '+94 76 456 7890',
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}

class _ToggleStoreBox extends StatefulWidget {
  final String title;
  final String description;
  final Color color;
  final String location;
  final String contactNumber;

  const _ToggleStoreBox({
    required this.title,
    required this.description,
    required this.color,
    required this.location,
    required this.contactNumber,
  });

  @override
  _ToggleStoreBoxState createState() => _ToggleStoreBoxState();
}

class _ToggleStoreBoxState extends State<_ToggleStoreBox> {
  bool _isToggled = false;

  void _toggleBox(BuildContext context) {
    setState(() {
      _isToggled = !_isToggled;
    });

    // If the box is toggled and the "NEXT" is shown, navigate to the ProductPage
    if (_isToggled) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => ProductPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _toggleBox(context), // Pass context to the _toggleBox method
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: widget.color,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.description,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '📍 ${widget.location}',
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '📞 ${widget.contactNumber}',
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white,
              ),
            ),
            if (_isToggled) ...[
              const SizedBox(height: 12),
              Center(
                child: Text(
                  'NEXT',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.amber.shade400,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
