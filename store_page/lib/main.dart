import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'store_provider.dart';
import 'store_selection_page.dart';
import 'store_model.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => StoreProvider()),
      ],
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dress Me',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dress Me', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.black,
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            final selectedStore = await Navigator.push<Store>(
              context,
              MaterialPageRoute(builder: (context) => StoreSelectionPage()),
            );
            if (selectedStore != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text('Selected Store: ${selectedStore.name}')),
              );
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black, // Background color
            foregroundColor: Colors.white, // Text color
            padding: const EdgeInsets.symmetric(
                horizontal: 32, vertical: 16), // Button padding
            textStyle: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ), // Text style
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(35), // Button border radius
            ),
          ),
          child: const Text('Select a Store'),
        ),
      ),
    );
  }
}
