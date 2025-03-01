import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:lottie/lottie.dart';
import 'finalProduct.dart';

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
                    'Experience the perfect blend of modern fashion and expert craftsmanship.',
                color: const Color.fromARGB(255, 28, 28, 28),
                location: 'Colombo 07, Sri Lanka',
                contactNumber: '+94 71 234 5678',
                mapUrl:
                    'https://www.google.com/maps/search/?api=1&query=Colombo+07+Sri+Lanka',
              ),
              const SizedBox(height: 16),
              _ToggleStoreBox(
                title: 'StyleAura',
                description:
                    'Timeless elegance with refined, sophisticated clothing.',
                color: const Color.fromARGB(255, 28, 28, 28),
                location: 'Galle Road, Matara',
                contactNumber: '+94 77 987 6543',
                mapUrl:
                    'https://www.google.com/maps/search/?api=1&query=Galle+Road+Matara',
              ),
              const SizedBox(height: 16),
              _ToggleStoreBox(
                title: 'ForYou Store',
                description: 'Bespoke tailoring services for a unique outfit.',
                color: const Color.fromARGB(255, 28, 28, 28),
                location: 'Kandy City Center, Kandy',
                contactNumber: '+94 76 456 7890',
                mapUrl:
                    'https://www.google.com/maps/search/?api=1&query=Kandy+City+Center+Kandy',
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
  final String mapUrl;

  const _ToggleStoreBox({
    required this.title,
    required this.description,
    required this.color,
    required this.location,
    required this.contactNumber,
    required this.mapUrl,
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

    if (_isToggled) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => ProductPage()),
      );
    }
  }

  void _openMap() async {
    final Uri url = Uri.parse(widget.mapUrl);
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      throw 'Could not open the map.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _toggleBox(context),
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
            GestureDetector(
              onTap: _openMap,
              child: Text(
                '📍 ${widget.location}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.blueAccent,
                  decoration: TextDecoration.underline,
                ),
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
