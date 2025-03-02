import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'suggestions.dart'; // Import SuggestionPage

class UploadPage extends StatefulWidget {
  const UploadPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _UploadPageState createState() => _UploadPageState();
}

class _UploadPageState extends State<UploadPage> {
  bool isUploading = false;
  bool uploadComplete = false;

  Uint8List? uploadedImage;
  final ImagePicker _picker = ImagePicker();

  Future<void> pickImage(ImageSource source) async {
    final XFile? image = await _picker.pickImage(source: source);
    if (image != null) {
      final bytes = await image.readAsBytes();
      setState(() {
        uploadedImage = bytes;
        isUploading = true;
      });

      // Simulate upload delay
      await Future.delayed(const Duration(seconds: 3));

      setState(() {
        isUploading = false;
        uploadComplete = true;
      });

      // Redirect to SuggestionPage after a short delay
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const SuggestionPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Top image with curved bottom
          ClipPath(
            clipper: CurvedBottomClipper(),
            child: Container(
              height: MediaQuery.of(context).size.height * 0.7,
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: AssetImage(
                      'assets/images/image19.jpeg'), // Replace with your image path
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
          // Content overlay
          Positioned.fill(
            child: Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10),
              child: Column(
                children: [
                  const Spacer(),
                  GestureDetector(
                    onTap: () => showImageSourceSelection(context),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            blurRadius: 10,
                            spreadRadius: 5,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: isUploading
                          ? buildUploadingPhase()
                          : uploadComplete
                              ? buildCompletedPhase()
                              : buildInitialPhase(),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          ),
          // Text added to the bottom white area
          Positioned(
            bottom: 0.1, // Adjust vertical positioning
            left: 16,
            right: 16,
            child: Text(
              "",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: const Color.fromARGB(255, 0, 0, 0),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildInitialPhase() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: const [
        Icon(Icons.cloud_upload_outlined, size: 100, color: Colors.grey),
        SizedBox(height: 20),
        Text(
          "Tap to upload photo",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        SizedBox(height: 8),
        Text(
          "PNG, JPG (max: 800x400px)",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  Widget buildUploadingPhase() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: const [
        CircularProgressIndicator(),
        SizedBox(height: 16),
        Text(
          "Uploading Document...",
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
      ],
    );
  }

  Widget buildCompletedPhase() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: const [
        Icon(Icons.check_circle_outline, size: 100, color: Colors.green),
        SizedBox(height: 16),
        Text(
          "Upload Complete",
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
      ],
    );
  }

  void showImageSourceSelection(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text("Take Photo"),
                onTap: () {
                  Navigator.pop(context);
                  pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo),
                title: const Text("Choose from Gallery"),
                onTap: () {
                  Navigator.pop(context);
                  pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class CurvedBottomClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path();
    path.lineTo(0, size.height - 80);
    path.quadraticBezierTo(
      size.width / 2,
      size.height,
      size.width,
      size.height - 80,
    );
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}
