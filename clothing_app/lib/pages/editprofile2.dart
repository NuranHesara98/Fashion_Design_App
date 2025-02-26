import 'package:flutter/material.dart';

class ProfileEditPage extends StatelessWidget {
  const ProfileEditPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Profile Section (Green Background with Cancel & Save)
            Stack(
              clipBehavior: Clip.none, // Allows the image to overflow outside
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: const Color.fromARGB(255, 106, 160, 103),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(40),
                      bottomRight: Radius.circular(40),
                    ),
                  ),
                  padding: EdgeInsets.only(top: 100, bottom: 60),
                  height: 280, // Adjusted height for better positioning
                ),
                Positioned(
                  top: 50,
                  left: 20,
                  child: GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: Text(
                      "Cancel",
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 50,
                  right: 20,
                  child: GestureDetector(
                    onTap: () {
                      // Add save functionality
                    },
                    child: Text(
                      "Save",
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                // Welcome Text centered in the green container
                Positioned(
                  top: 120, // Adjust the vertical position to center the text
                  left: 0,
                  right: 0,
                  child: Center(
                    child: RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: "W E L C O M E\n", // "WELCOME" text
                            style: TextStyle(
                              fontSize: 32, // Increased font size for "WELCOME"
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(
                            text: "to your profile", // "to your profile" text
                            style: TextStyle(
                              fontSize:
                                  25, // Normal font size for the second part
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                Positioned(
                  bottom: -40, // Moves half of the image outside the container
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      padding:
                          EdgeInsets.all(0), // Padding around the CircleAvatar
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white, // White outline
                          width: 5, // Width of the border
                        ),
                      ),
                      child: CircleAvatar(
                        radius: 50,
                        backgroundImage: AssetImage(
                            "assets/images/image1.jpg"), // Replace with user image
                      ),
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: 50), // Increased space due to avatar position

            // User Info Form
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTextField("Name", "Charlotte King"),
                  _buildTextField(
                      "E-mail Address", "@johnkinggraphics.gmail.com"),
                  _buildTextField("User Name", "@johnkinggraphics"),
                  _buildTextField("Phone Number", "+91 6895312"),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey)),
          SizedBox(height: 5),
          TextField(
            decoration: InputDecoration(
              hintText: value,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              fillColor: Colors.white,
              filled: true,
            ),
          ),
        ],
      ),
    );
  }
}
