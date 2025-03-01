import 'package:clothing_app/pages/home2.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'uploadimage.dart'; // Import UploadPage
import 'home.dart';
import 'menu.dart';

class TwoOptionsPage extends StatelessWidget {
  const TwoOptionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.menu), // 3-line menu icon
          onPressed: () {
            // Navigate to ProfilePage when the menu icon is clicked
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ProfilePage()),
            );
          },
        ),
        backgroundColor: Colors.transparent, // Removed blue background
        elevation: 0, // Removes shadow
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Pick One Option",
              style: TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            SizedBox(height: 50),
            _buildOptionBox(
              context,
              "Photo Based Suggestions",
              "This is a description for option 1. You can customize this text as needed.",
              "assets/animations/Animation9.json",
              () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const UploadPage()),
                );
              },
            ),
            SizedBox(height: 20), // Spacing between boxes
            _buildOptionBox(
              context,
              "Questionario Based Suggestions",
              "This is a description for option 2. Customize this text for your needs.",
              "assets/animations/Animation11.json",
              () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const HomePage()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionBox(BuildContext context, String title, String description,
      String animationPath, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 5,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    description,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 10),
            Lottie.asset(
              animationPath,
              width: 80,
              height: 80,
              fit: BoxFit.cover,
            ),
          ],
        ),
      ),
    );
  }
}
