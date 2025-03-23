import 'package:flutter/material.dart';

class ConfirmationPage extends StatefulWidget {
  @override
  _ConfirmationPageState createState() => _ConfirmationPageState();
}

class _ConfirmationPageState extends State<ConfirmationPage> {
  String shippingName = "Jane Doe";
  String shippingAddress = "123 Fashion St, Dressville";
  String contactNumber = "+1 234 567 890";
  String itemName = "Elegant Summer Dress";
  double itemPrice = 49.99;
  double shippingFee = 5.99;

  bool isEditingName = false;
  bool isEditingAddress = false;
  bool isEditingContact = false;

  final TextEditingController nameController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController contactController = TextEditingController();

  String selectedPaymentMethod = "Credit Card";

  final TextEditingController cardNumberController = TextEditingController();
  final TextEditingController expiryDateController = TextEditingController();
  final TextEditingController cvvController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order Confirmation'),
        centerTitle: true,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.black, Colors.grey[800]!],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.grey[50]!, Colors.white],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: ListView(
          padding: EdgeInsets.all(24.0),
          children: [
            _buildSectionTitle('Shipping Details'),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    buildEditableSection(
                      "Shipping Name",
                      shippingName,
                      isEditingName,
                      () => setState(() {
                        isEditingName = true;
                        nameController.text = shippingName;
                      }),
                      (value) => setState(() {
                        shippingName = value;
                        isEditingName = false;
                      }),
                      nameController,
                    ),
                    Divider(height: 1),
                    buildEditableSection(
                      "Shipping Address",
                      shippingAddress,
                      isEditingAddress,
                      () => setState(() {
                        isEditingAddress = true;
                        addressController.text = shippingAddress;
                      }),
                      (value) => setState(() {
                        shippingAddress = value;
                        isEditingAddress = false;
                      }),
                      addressController,
                    ),
                    Divider(height: 1),
                    buildEditableSection(
                      "Contact Number",
                      contactNumber,
                      isEditingContact,
                      () => setState(() {
                        isEditingContact = true;
                        contactController.text = contactNumber;
                      }),
                      (value) => setState(() {
                        contactNumber = value;
                        isEditingContact = false;
                      }),
                      contactController,
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),
            _buildSectionTitle('Order Summary'),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildOrderDetail("Item", itemName),
                    _buildOrderDetail(
                        "Price", "\$${itemPrice.toStringAsFixed(2)}"),
                    _buildOrderDetail(
                        "Shipping Fee", "\$${shippingFee.toStringAsFixed(2)}"),
                    Divider(thickness: 1),
                    _buildOrderDetail(
                      "Total",
                      "\$${(itemPrice + shippingFee).toStringAsFixed(2)}",
                      isTotal: true,
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),
            _buildSectionTitle('Payment Method'),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildPaymentOption("Credit Card", Icons.credit_card),
                    _buildPaymentOption("PayPal", Icons.payment),
                    _buildPaymentOption(
                        "Cash on Delivery", Icons.local_shipping),
                    if (selectedPaymentMethod == "Credit Card") ...[
                      SizedBox(height: 16),
                      _buildStyledTextField(
                        controller: cardNumberController,
                        label: "Card Number",
                        keyboardType: TextInputType.number,
                      ),
                      SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildStyledTextField(
                              controller: expiryDateController,
                              label: "MM/YY",
                              keyboardType: TextInputType.datetime,
                            ),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: _buildStyledTextField(
                              controller: cvvController,
                              label: "CVV",
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
            SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => _handleOrderConfirmation(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                padding: EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                "Confirm Order",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
            SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildOrderDetail(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: Colors.black87,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? Colors.green : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(String title, IconData icon) {
    return RadioListTile<String>(
      title: Row(
        children: [
          Icon(icon, size: 24, color: Colors.black87),
          SizedBox(width: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
        ],
      ),
      value: title,
      groupValue: selectedPaymentMethod,
      onChanged: (value) {
        setState(() {
          selectedPaymentMethod = value!;
        });
      },
      activeColor: Colors.black,
      contentPadding: EdgeInsets.symmetric(horizontal: 0),
    );
  }

  Widget _buildStyledTextField({
    required TextEditingController controller,
    required String label,
    required TextInputType keyboardType,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.grey[600]),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.black),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
    );
  }

  Widget buildEditableSection(
    String label,
    String value,
    bool isEditing,
    VoidCallback onEdit,
    ValueChanged<String> onSave,
    TextEditingController controller,
  ) {
    if (isEditing) {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 8),
                IconButton(
                  icon: Icon(Icons.check, color: Colors.green),
                  onPressed: () => onSave(controller.text),
                ),
              ],
            ),
          ],
        ),
      );
    }
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(
        label,
        style: TextStyle(
          fontSize: 14,
          color: Colors.grey[600],
        ),
      ),
      subtitle: Text(
        value,
        style: TextStyle(
          fontSize: 16,
          color: Colors.black87,
          height: 1.5,
        ),
      ),
      trailing: IconButton(
        icon: Icon(Icons.edit, color: Colors.black54),
        onPressed: onEdit,
      ),
    );
  }

  void _handleOrderConfirmation(BuildContext context) {
    if (selectedPaymentMethod == "Credit Card" &&
        (cardNumberController.text.isEmpty ||
            expiryDateController.text.isEmpty ||
            cvvController.text.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Please fill in all credit card details."),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          "Order Confirmed",
          style: TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.check_circle,
              color: Colors.green,
              size: 48,
            ),
            SizedBox(height: 16),
            Text(
              "Thank you for shopping with Dress Me!",
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 8),
            Text(
              "Payment Method: $selectedPaymentMethod",
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: Text(
              "OK",
              style: TextStyle(color: Colors.black),
            ),
          ),
        ],
      ),
    );
  }
}
