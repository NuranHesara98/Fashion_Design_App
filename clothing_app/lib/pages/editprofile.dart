import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart'; // Import image_picker
import 'dart:io'; // For File class
import 'dart:html' as html; // For web-specific file handling
import 'package:flutter/foundation.dart'; // For kIsWeb

class UserProfilePage extends StatefulWidget {
  @override
  _UserProfilePageState createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  bool isEditing = false;
  File? _profileImage; // To store the selected image file (for mobile)
  String? _imageUrl; // To store the image URL (for web)
  final ImagePicker _picker = ImagePicker(); // ImagePicker instance

  Map<String, String> userData = {
    'name': 'Anna Avetisyan',
    'role': 'Senior Product Designer',
    'birthday': 'January 1, 1990',
    'phoneNumber': '+1 818 123 4567',
    'email': 'info@aplusdesign.co',
    'address': '123 Fashion Street, Style City',
    'password': '********', // Added password field
  };

  late Map<String, TextEditingController> controllers;

  @override
  void initState() {
    super.initState();
    controllers = userData
        .map((key, value) => MapEntry(key, TextEditingController(text: value)));
  }

  @override
  void dispose() {
    controllers.values.forEach((controller) => controller.dispose());
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

  // Function to pick an image from the gallery or camera
  Future<void> _pickImage(ImageSource source) async {
    final XFile? image = await _picker.pickImage(source: source);
    if (image != null) {
      if (kIsWeb) {
        // For web, convert the file to a URL
        final bytes = await image.readAsBytes();
        final blob = html.Blob([bytes]);
        final url = html.Url.createObjectUrlFromBlob(blob);
        setState(() {
          _imageUrl = url;
        });
      } else {
        // For mobile, use the file directly
        setState(() {
          _profileImage = File(image.path);
        });
      }
    }
  }

  // Show a bottom sheet to choose image source (camera or gallery)
  void _showImageSourceSelection(BuildContext context) {
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
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo),
                title: const Text("Choose from Gallery"),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
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
              theme.colorScheme.background,
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
                title: Text('Profile', style: theme.textTheme.headlineMedium),
                actions: [
                  Padding(
                    padding: EdgeInsets.only(right: 16),
                    child: FilledButton.icon(
                      onPressed: toggleEdit,
                      icon: AnimatedSwitcher(
                        duration: Duration(milliseconds: 200),
                        child: Icon(
                          isEditing ? Icons.check : Icons.edit,
                          key: ValueKey<bool>(isEditing),
                          size: 20,
                          color: Colors.white,
                        ),
                      ),
                      label: Text(
                        isEditing ? 'Save' : 'Edit',
                        style: TextStyle(color: Colors.white),
                      ),
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        padding:
                            EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                    ),
                  ),
                ],
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
    );
  }

  Widget _buildProfileSection(ThemeData theme) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            GestureDetector(
              onTap:
                  isEditing ? () => _showImageSourceSelection(context) : null,
              child: Container(
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
                  child: kIsWeb
                      ? _imageUrl != null
                          ? Image.network(
                              _imageUrl!,
                              fit: BoxFit.cover,
                            )
                          : Image.asset(
                              'assets/images/profile_placeholder.jpg',
                              fit: BoxFit.cover,
                            )
                      : _profileImage != null
                          ? Image.file(
                              _profileImage!,
                              fit: BoxFit.cover,
                            )
                          : Image.asset(
                              'assets/images/profile_placeholder.jpg',
                              fit: BoxFit.cover,
                            ),
                ),
              ),
            ),
            if (isEditing)
              Positioned(
                bottom: 0,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.camera_alt_rounded,
                          color: Colors.white, size: 16),
                      SizedBox(width: 4),
                      Text(
                        'Change',
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
        SizedBox(height: 16),
        if (isEditing) ...[
          _buildEditableField(
            controllers['name']!,
            style: theme.textTheme.headlineMedium,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 8),
          _buildEditableField(
            controllers['role']!,
            style: theme.textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
        ] else ...[
          Text(
            userData['name']!,
            style: theme.textTheme.headlineMedium,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 4),
          Text(
            userData['role']!,
            style: theme.textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
            textAlign: TextAlign.center,
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
          children: [
            _buildDetailItem(
              theme: theme,
              icon: Icons.cake_rounded,
              label: 'Birthday',
              controller: controllers['birthday']!,
            ),
            _buildDivider(),
            _buildDetailItem(
              theme: theme,
              icon: Icons.phone_rounded,
              label: 'Phone',
              controller: controllers['phoneNumber']!,
            ),
            _buildDivider(),
            _buildDetailItem(
              theme: theme,
              icon: Icons.email_rounded,
              label: 'Email',
              controller: controllers['email']!,
            ),
            _buildDivider(),
            _buildDetailItem(
              theme: theme,
              icon: Icons.location_on_rounded,
              label: 'Address',
              controller: controllers['address']!,
            ),
            _buildDivider(),
            _buildDetailItem(
              theme: theme,
              icon: Icons.lock_rounded,
              label: 'Password',
              controller: controllers['password']!,
              isPassword: true, // Added password field
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEditableField(
    TextEditingController controller, {
    TextStyle? style,
    TextAlign textAlign = TextAlign.start,
    bool isPassword = false, // Added isPassword parameter
  }) {
    return TextField(
      controller: controller,
      style: style,
      textAlign: textAlign,
      obscureText: isPassword, // Hide text for password field
      decoration: InputDecoration(
        isDense: true,
        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }

  Widget _buildDetailItem({
    required ThemeData theme,
    required IconData icon,
    required String label,
    required TextEditingController controller,
    bool isPassword = false, // Added isPassword parameter
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 24, color: Colors.grey[400]),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 4),
                if (isEditing)
                  _buildEditableField(
                    controller,
                    isPassword: isPassword, // Pass isPassword to the field
                  )
                else
                  Text(
                    isPassword ? '********' : controller.text, // Mask password
                    style: theme.textTheme.bodyLarge,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Divider(color: Colors.grey[200]),
    );
  }
}
