import 'package:flutter/material.dart';
import 'userprofilepage.dart'; // Import your UserProfilePage
import 'helpcenter.dart'; // Ensure this file exists
import 'favorite.dart'; // Import the FavoritePage

class ProfilePage extends StatelessWidget {
  final Set<ProductCardData> favorites; // Add favorites parameter

  const ProfilePage({super.key, required this.favorites});

  @override
  Widget build(BuildContext context) {
    // Define user data here
    Map<String, String> userData = {
      'name': 'Jack William',
      'email': 'jackwilliam1704@gmail.com',
      'role': 'Fashion Enthusiast', // Add a role or other details if needed
      'birthday': 'January 1, 1990',
      'phoneNumber': '+1 818 123 4567',
      'address': '123 Fashion Street, Style City',
      'password': '********', // Added password field
    };

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text("Profile", style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundImage: AssetImage("assets/images/image1.jpg"),
                    child: Align(
                      alignment: Alignment.bottomRight,
                      child: CircleAvatar(
                        backgroundColor: Colors.green,
                        radius: 12,
                        child: Icon(Icons.check, color: Colors.white, size: 16),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    userData['name']!, // Use user data
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    userData['email']!, // Use user data
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _buildMenuItem(
                context,
                Icons.person,
                "Edit Profile",
                UserProfilePage(
                    userData: userData)), // Pass user data to UserProfilePage
            _buildMenuItem(context, Icons.payment, "Payment Method", null),
            _buildMenuItem(context, Icons.language, "Language", null),
            _buildMenuItem(context, Icons.history, "Order History", null),
            _buildMenuItem(
              context,
              Icons.favorite,
              "Favourites",
              FavoritePage(
                  favorites: favorites), // Pass favorites to FavoritePage
            ),
            _buildMenuItem(
                context, Icons.help, "Help Center", const HelpPage()),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        selectedItemColor: Colors.green,
        unselectedItemColor: Colors.grey,
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: ""),
          BottomNavigationBarItem(icon: Icon(Icons.favorite), label: ""),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: ""),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
      BuildContext context, IconData icon, String title, Widget? page) {
    return ListTile(
      leading: Icon(icon, color: Colors.black),
      title: Text(title, style: TextStyle(fontSize: 16)),
      trailing: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
      onTap: () {
        if (page != null) {
          Navigator.of(context)
              .push(MaterialPageRoute(builder: (context) => page));
        }
      },
    );
  }
}
