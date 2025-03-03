// main.dart
import 'package:flutter/material.dart';
import 'confirmation_page.dart';

void main() {
  runApp(DressMeApp());
}

class DressMeApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dress Me Confirmation',
      theme: ThemeData(
        primarySwatch: Colors.grey,
        fontFamily: 'Poppins',
        scaffoldBackgroundColor: Colors.grey[50],
        appBarTheme: AppBarTheme(
          elevation: 0,
          backgroundColor: Colors.black,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black,
            foregroundColor: Colors.white,
            padding: EdgeInsets.symmetric(vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      ),
      home: ConfirmationPage(),
    );
  }
}
