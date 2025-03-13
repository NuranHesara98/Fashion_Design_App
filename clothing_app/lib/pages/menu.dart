import 'package:flutter/material.dart';
import 'userprofilepage.dart';
import 'helpcenter.dart';
import 'favorite.dart';
import 'login.dart';

class ProfilePage extends StatefulWidget {
  final Set<ProductCardData> favorites;

  const ProfilePage({super.key, required this.favorites});

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  Widget build(BuildContext context) {
    Map<String, String> userData = {
      'name': 'Jack William',
      'email': 'jackwilliam1704@gmail.com',
      'role': 'Fashion Enthusiast',
      'birthday': 'January 1, 1990',
      'phoneNumber': '+1 818 123 4567',
      'address': '123 Fashion Street, Style City',
      'password': '********',
    };

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text("Profile",
            style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 30),
            _buildProfileCard(userData),
            const SizedBox(height: 20),
            _buildMenuItem(context, Icons.person, "Edit Profile",
                UserProfilePage(userData: userData)),
            _buildMenuItem(context, Icons.history, "Order History", null),
            _buildMenuItem(context, Icons.favorite, "Favourites",
                FavoritePage(favorites: widget.favorites)),
            _buildMenuItem(
                context, Icons.help, "Help Center", const HelpPage()),
            const SizedBox(height: 30),
            _buildLogoutButton(context),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard(Map<String, String> userData) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
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
                child: const Icon(Icons.check, color: Colors.white, size: 16),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            userData['name']!,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 5),
          Text(
            userData['email']!,
            style: const TextStyle(fontSize: 14, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
      BuildContext context, IconData icon, String title, Widget? page) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      child: InkWell(
        onTap: () {
          if (page != null) {
            Navigator.of(context)
                .push(MaterialPageRoute(builder: (context) => page));
          }
        },
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 15),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 6,
                offset: Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: Colors.black),
                  const SizedBox(width: 15),
                  Text(title, style: const TextStyle(fontSize: 16)),
                ],
              ),
              const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: ElevatedButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text("Log Out"),
              content: const Text("Are you sure you want to log out?"),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text("Cancel"),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const LoginPage()),
                    );
                  },
                  child: const Text("Log Out",
                      style: TextStyle(color: Colors.red)),
                ),
              ],
            ),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color.fromARGB(255, 23, 67, 92),
          foregroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          padding: const EdgeInsets.symmetric(vertical: 15),
        ),
        child: const Center(
          child: Text("Log Out",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
