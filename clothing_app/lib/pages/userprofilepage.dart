import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart'; // Import image_picker
import 'dart:io'; // For File class

class UserProfilePage extends StatefulWidget {
  final Map<String, String> userData;

  UserProfilePage({required this.userData});

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
            if (isEditing)
              Positioned(
                bottom: 0,
                child: GestureDetector(
                  onTap: _pickImage, // Call _pickImage when tapped
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
              isPassword: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem({
    required ThemeData theme,
    required IconData icon,
    required String label,
    required TextEditingController controller,
    bool isPassword = false,
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
                    isPassword: isPassword,
                  )
                else
                  Text(
                    isPassword ? '********' : controller.text,
                    style: theme.textTheme.bodyLarge,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditableField(
    TextEditingController controller, {
    TextStyle? style,
    TextAlign textAlign = TextAlign.start,
    bool isPassword = false,
  }) {
    return TextField(
      controller: controller,
      style: style,
      textAlign: textAlign,
      obscureText: isPassword,
      decoration: InputDecoration(
        isDense: true,
        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
