import 'package:flutter/material.dart';
import 'editprofile.dart'; // Ensure this file contains the UserProfilePage class
import 'helpcenter.dart'; // Ensure this file exists

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
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
                    "Jack William",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    "jackwilliam1704@gmail.com",
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _buildMenuItem(context, Icons.person, "Edit Profile",
                UserProfilePage()), // Updated to UserProfilePage
            _buildMenuItem(context, Icons.payment, "Payment Method", null),
            _buildMenuItem(context, Icons.language, "Language", null),
            _buildMenuItem(context, Icons.history, "Order History", null),
            _buildMenuItem(context, Icons.favorite, "Favourites", null),
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
