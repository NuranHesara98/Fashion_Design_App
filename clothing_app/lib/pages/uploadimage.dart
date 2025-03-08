import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lottie/lottie.dart';
import 'suggestions.dart';

class UploadPage extends StatefulWidget {
  const UploadPage({super.key});

  @override
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
          // Animated Background - Centered Horizontally
          Positioned(
            top: 50, // Move it slightly up
            left: 0,
            right: 0,
            child: Center(
              // Centering Horizontally
              child: SizedBox(
                height:
                    MediaQuery.of(context).size.height * 0.7, // Adjust height
                child: Lottie.asset(
                  'assets/animations/Animation11.json', // Replace with your animation file
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ),

          // Upload Button Section
          Positioned(
            bottom: 80,
            left: 20,
            right: 20,
            child: GestureDetector(
              onTap: () => showImageSourceSelection(context),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
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
