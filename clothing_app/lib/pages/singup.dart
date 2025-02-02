import 'package:flutter/material.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();
  bool _isPasswordVisible = false; // For the "Password" field
  bool _isConfirmPasswordVisible = false; // For the "Confirm Password" field

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // App Title
                Text(
                  'DressMe',
                  style: TextStyle(
                    fontSize: 32.0,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Cursive',
                    color: Color(0xFF000000),
                  ),
                ),
                const SizedBox(height: 32.0),

                // Email Field
                _buildTextField(
                  controller: _emailController,
                  hint: "Email",
                ),
                const SizedBox(height: 16.0),

                // Username Field 
                _buildTextField(                    
                  controller: _usernameController,
                  hint: "Username",
                ),
                const SizedBox(height: 16.0),

                // Password Field
                _buildPasswordField(
                  controller: _passwordController,
                  hint: "Password",
                  isVisible: _isPasswordVisible,
                  onVisibilityToggle: () {
                    setState(() {
                      _isPasswordVisible = !_isPasswordVisible;
                    });
                  },
                ),
                const SizedBox(height: 8.0),

                // Confirm Password Field
                _buildPasswordField(
                  controller: _confirmPasswordController,
                  hint: "Confirm Password",
                  isVisible: _isConfirmPasswordVisible,
                  onVisibilityToggle: () {
                    setState(() {
                      _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                    });
                  },
                ),
                const SizedBox(height: 24.0),

                // Forgot Password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      // Navigate to Forgot Password Page
                      Navigator.pushNamed(context, '/forgot-password');
                    },
                    child: const Text(
                      "Forgot Password?",
                      style: TextStyle(
                        fontSize: 14.0,
                        color: Color(0xFF000000),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8.0),

                // Sign-Up Button
                ElevatedButton(
                  onPressed: () {
                    _handleSignUp();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF000000),
                    minimumSize: Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                  child: const Text(
                    "Sign up",
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFFFFFFFF),
                    ),
                  ),
                ),
                const SizedBox(height: 16.0),

                // Continue with Google Button
                OutlinedButton.icon(
                  onPressed: () {
                    // Handle Google sign-in
                  },
                  style: OutlinedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    side: BorderSide(color: Colors.black),
                  ),
                  icon: Image.asset('assets/images/google_icon.png',
                      height: 24.0),
                  label: const Text(
                    "Continue with Google",
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF000000),
                    ),
                  ),
                ),
                const SizedBox(height: 16.0),

                // "Have an account? Sign in" Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      "Have an account?",
                      style: TextStyle(
                        fontSize: 14.0,
                        color: Color(0xFF000000),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/sign-in');
                      },
                      child: const Text(
                        "Sign in",
                        style: TextStyle(
                          fontSize: 14.0,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF000000),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Handle Sign-Up Logic
  void _handleSignUp() {
    if (_emailController.text.isEmpty ||
        _usernameController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _confirmPasswordController.text.isEmpty) {
      _showSnackBar("Please fill in all fields.");
    } else if (_passwordController.text != _confirmPasswordController.text) {
      _showSnackBar("Passwords do not match. Please try again.");
    } else {
      // Navigate to Home Page (or next step)
      Navigator.pushNamed(context, '/home');
    }
  }

  // Show SnackBar
  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
      ),
    );
  }

  // Text Field for Email/Username
  Widget _buildTextField(
      {required TextEditingController controller, required String hint}) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF000000)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
      ),
      style: const TextStyle(color: Color(0xFF000000)),
    );
  }

  // Password Field with Visibility Toggle
  Widget _buildPasswordField({
    required TextEditingController controller,
    required String hint,
    required bool isVisible,
    required VoidCallback onVisibilityToggle,
  }) {
    return TextField(
      controller: controller,
      obscureText: !isVisible,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF000000)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        suffixIcon: IconButton(
          icon: Icon(
            isVisible ? Icons.visibility : Icons.visibility_off,
            color: const Color(0xFF000000),
          ),
          onPressed: onVisibilityToggle,
        ),
      ),
      style: const TextStyle(color: Color(0xFF000000)),
    );
  }
}
