import 'package:clothing_app/Onbording/onbording_view.dart';
import 'package:clothing_app/pages/singup.dart';
import 'package:clothing_app/pages/login.dart';
import 'package:clothing_app/pages/home.dart';
import 'package:clothing_app/pages/customizing.dart'; // Import CustomizePage
import 'package:clothing_app/pages/store.dart';
import 'package:clothing_app/pages/suggestions.dart';
// ignore: duplicate_import
import 'package:clothing_app/pages/store.dart';
import 'package:clothing_app/pages/getstart.dart'; // Import SuggestionPage
import 'package:flutter/material.dart';
import 'dart:async';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Clothing App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
        fontFamily: 'Roboto',
        textTheme: const TextTheme(
          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          bodyLarge: TextStyle(fontSize: 16),
          bodyMedium: TextStyle(fontSize: 14),
        ),
      ),
      home: const SplashScreen(),
      routes: {
        '/signup': (context) => const SignUpPage(),
        '/login': (context) => const LoginPage(),
        '/onboarding': (context) => const OnboardingView(),
        '/home': (context) => HomePage(),
        '/customize': (context) => const CustomizePage(),
        '/suggestion': (context) => const SuggestionPage(),
        '/welcome': (context) => const WelcomeScreen(),
        '/store': (context) => const StorePage(),
      },
      onUnknownRoute: (settings) {
        return MaterialPageRoute(
          builder: (context) => Scaffold(
            body: Center(
              child: const Text(
                "404: Page not found",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        );
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();

    // Initialize animation controller
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    // Set up fade animation
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);

    // Start animation and timer
    _controller.forward();
    Timer(const Duration(seconds: 3), () {
      Navigator.pushReplacementNamed(context, '/onboarding');
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: FadeTransition(
        opacity: _animation,
        child: Center(
          child: Image.asset(
            'assets/images/logo.png',
            //Ensure this path is correct
            width: 250,
            height: 250,
          ),
        ),
      ),
    );
  }
}
