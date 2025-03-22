import 'package:flutter/material.dart';
import 'store_model.dart';

class StoreProvider with ChangeNotifier {
  List<Store> _stores = [];
  List<Store> get stores => _stores;

  StoreProvider() {
    fetchStores();
  }

  void fetchStores() {
    _stores = [
      Store(
        id: '1',
        name: 'LUXURY BOUTIQUE',
        address: '123 Fashion Avenue, New York',
        distance: 2.5,
        imageUrl: 'assets/store1.jpg',
        openingHours: '9:00 AM - 9:00 PM',
        rating: 4.8,
      ),
      Store(
        id: '2',
        name: 'DESIGNER GALLERY',
        address: '456 Style Street, Manhattan',
        distance: 3.0,
        imageUrl: 'assets/store2.jpg',
        openingHours: '10:00 AM - 8:00 PM',
        rating: 4.6,
      ),
      Store(
        id: '3',
        name: 'FASHION HOUSE',
        address: '789 Trendy Boulevard, Brooklyn',
        distance: 1.5,
        imageUrl: 'assets/store3.jpg',
        openingHours: '11:00 AM - 7:00 PM',
        rating: 4.9,
      ),
    ];
    notifyListeners();
  }
}
