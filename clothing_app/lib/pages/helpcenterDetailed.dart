import 'package:flutter/material.dart';

class FirstPage extends StatefulWidget {
  final String searchKeyword;

  const FirstPage({super.key, required this.searchKeyword});

  @override
  _FirstPageState createState() => _FirstPageState();
}

class _FirstPageState extends State<FirstPage> {
  late List<Map<String, String>> helpContent;
  late List<Map<String, String>> filteredContent;

  @override
  void initState() {
    super.initState();
    // Define all help content
    helpContent = [
      {
        'title': 'Creating an Account',
        'description':
            'Tap on Sign Up and enter your email/phone number. Set a password, verify via OTP, and complete your profile.'
      },
      {
        'title': 'Navigating the App',
        'description':
            'Home Screen – Start customizing or explore designs. Menu – Access saved designs, orders, and settings.'
      },
      {
        'title': 'System Requirements',
        'description':
            'Compatible with Android 7.0+ / iOS 12+. Requires an active internet connection.'
      },
      {
        'title': 'How to Start Customizing',
        'description':
            'Select Start Customization, answer guided questions, and modify colors, patterns, and fabrics.'
      },
      {
        'title': 'Editing & Saving Designs',
        'description':
            'Tap Save to store your design. Access saved designs in My Designs. Tap Edit to make changes.'
      },
      {
        'title': 'Previewing Your Customization',
        'description':
            'Use the 360° View to see your outfit from all angles and share it before ordering.'
      },
      {
        'title': 'Placing an Order',
        'description':
            'Select a saved design, choose a tailor/shop, confirm pricing, make payment, and receive confirmation.'
      },
      {
        'title': 'Payment Options',
        'description':
            'Supports COD, bank transfers, and mobile payments like eZ Cash, FriMi, and PayHere.'
      },
      {
        'title': 'Order Tracking & Delivery',
        'description':
            'Track your order status in the Orders section and receive notifications upon completion.'
      },
      {
        'title': 'Updating Your Profile',
        'description':
            'Go to Account Settings > Edit Profile to update your details and password.'
      },
      {
        'title': 'Managing Saved Designs',
        'description':
            'View all saved designs in My Designs. Delete unwanted designs if needed.'
      },
      {
        'title': 'Language Settings',
        'description': 'Switch between Sinhala and English in Settings.'
      },
      {
        'title': 'Common Issues & Solutions',
        'description':
            'Fix app crashes, slow loading, and login issues. Refresh order updates if needed.'
      },
      {
        'title': 'Contact Support',
        'description':
            'Live Chat available in-app, email support at support@yourapp.com, and phone support at +94 XXXXXXXX.'
      },
      {
        'title': 'FAQs',
        'description':
            'Can I cancel my order? – Yes, before production starts.\n Delivery time? – 3-7 days.\n Changes after ordering? – Depends on tailor/shop.'
      },
    ];

    // Apply filtering based on search keyword
    _filterContent(widget.searchKeyword);
  }

  void _filterContent(String keyword) {
    if (keyword.isEmpty) {
      // Show all content if search is empty
      filteredContent = List.from(helpContent);
    } else {
      List<String> searchWords =
          keyword.toLowerCase().split(' '); // Split the search query into words

      filteredContent = helpContent.where((item) {
        List<String> titleWords =
            item['title']!.toLowerCase().split(' '); // Split title into words

        // Check if any search word matches any word in the title
        return searchWords.any((word) => titleWords.contains(word));
      }).toList();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Help Center'),
        backgroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: filteredContent.isEmpty
              ? [
                  Center(
                      child: Text(
                          "No results found for '${widget.searchKeyword}'"))
                ]
              : filteredContent
                  .map((item) =>
                      _buildArticle(item['title']!, item['description']!))
                  .toList(),
        ),
      ),
    );
  }

  Widget _buildArticle(String title, String description) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(description),
          ],
        ),
      ),
    );
  }
}
