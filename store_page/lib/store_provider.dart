import 'package:flutter/material.dart';
import 'store_model.dart';

class StoreProvider with ChangeNotifier {
  List<Store> _stores = [];

  List<Store> get stores => _stores;

  StoreProvider() {
    fetchStores(); // Fetch stores when the provider is initialized
  }

  void fetchStores() {
    _stores = [
      Store(id: '1', name: 'Store A', address: '123 Main St', distance: 2.5),
      Store(id: '2', name: 'Store B', address: '456 Elm St', distance: 3.0),
      Store(id: '3', name: 'Store C', address: '789 Oak St', distance: 1.5),
    ];
    notifyListeners();
  }
}
