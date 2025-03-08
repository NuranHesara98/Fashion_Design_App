import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart'; // Import image_picker
import 'dart:io'; // For File class

class UserProfilePage extends StatefulWidget {
  final Map<String, String> userData;

  const UserProfilePage({super.key, required this.userData});

  @override
  _UserProfilePageState createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  bool isEditing = false;
  File? _profileImage; // To store the selected image

  late Map<String, String> userData;
  late Map<String, TextEditingController> controllers;

  final ImagePicker _picker = ImagePicker(); // ImagePicker instance

  @override
  void initState() {
    super.initState();
    userData = widget.userData;
    controllers = userData
        .map((key, value) => MapEntry(key, TextEditingController(text: value)));
  }

  @override
  void dispose() {
    for (var controller in controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void toggleEdit() {
    if (isEditing) {
      setState(() {
        userData = controllers
            .map((key, controller) => MapEntry(key, controller.text));
      });
    }
    setState(() {
      isEditing = !isEditing;
    });
  }

  // Function to pick an image from the gallery
  Future<void> _pickImage() async {
    final XFile? pickedFile =
        await _picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _profileImage = File(pickedFile.path); // Update the profile image
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              theme.colorScheme.surface,
              Colors.white,
            ],
            stops: [0.0, 0.8],
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              SliverAppBar(
                floating: true,
                snap: true,
              ),
              SliverPadding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    SizedBox(height: 20),
                    _buildProfileSection(theme),
                    SizedBox(height: 32),
                    _buildDetailsCard(theme),
                    SizedBox(height: 32),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: toggleEdit,
        backgroundColor: Colors.black,
        child: Icon(
          isEditing ? Icons.check : Icons.edit,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildProfileSection(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center, // Center align
      children: [
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 4),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    spreadRadius: 2,
                    blurRadius: 10,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(60),
                child: _profileImage != null
                    ? Image.file(
                        _profileImage!,
                        fit: BoxFit.cover,
                      )
                    : Image.asset(
                        'assets/images/image1.jpg',
                        fit: BoxFit.cover,
                      ),
              ),
            ),
          ],
        ),
        SizedBox(height: 16),
        if (isEditing) ...[
          Center(
            // Center text fields in edit mode
            child: _buildEditableField(controllers['name']!,
                style: theme.textTheme.headlineMedium),
          ),
          SizedBox(height: 8),
          Center(
            child: _buildEditableField(controllers['role']!,
                style: theme.textTheme.bodyLarge
                    ?.copyWith(color: Colors.grey[600])),
          ),
        ] else ...[
          Center(
            child:
                Text(userData['name']!, style: theme.textTheme.headlineMedium),
          ),
          SizedBox(height: 4),
          Center(
            child: Text(userData['role']!,
                style: theme.textTheme.bodyLarge
                    ?.copyWith(color: Colors.grey[600])),
          ),
        ],
      ],
    );
  }

  Widget _buildDetailsCard(ThemeData theme) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailItem(theme, Icons.cake_rounded, 'Birthday',
                controllers['birthday']!),
            _buildDivider(),
            _buildDetailItem(theme, Icons.phone_rounded, 'Phone',
                controllers['phoneNumber']!),
            _buildDivider(),
            _buildDetailItem(
                theme, Icons.email_rounded, 'Email', controllers['email']!),
            _buildDivider(),
            _buildDetailItem(theme, Icons.location_on_rounded, 'Address',
                controllers['address']!),
            _buildDivider(),
            _buildDetailItem(
                theme, Icons.lock_rounded, 'Password', controllers['password']!,
                isPassword: true),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(ThemeData theme, IconData icon, String label,
      TextEditingController controller,
      {bool isPassword = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600], fontWeight: FontWeight.w500)),
        SizedBox(height: 4),
        if (isEditing)
          _buildEditableField(controller, isPassword: isPassword)
        else
          Text(isPassword ? '********' : controller.text,
              style: theme.textTheme.bodyLarge),
      ],
    );
  }

  Widget _buildEditableField(TextEditingController controller,
      {TextStyle? style, bool isPassword = false}) {
    return TextField(
      controller: controller,
      style: style,
      obscureText: isPassword,
      decoration: InputDecoration(
          isDense: true,
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
    );
  }

  Widget _buildDivider() {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Divider(color: Colors.grey[200]),
    );
  }
}
