// store_model.dart
class Store {
  final String id;
  final String name;
  final String address;
  final double distance;
  final String imageUrl;
  final String openingHours;
  final double rating;
  bool isFavorite;

  Store({
    required this.id,
    required this.name,
    required this.address,
    required this.distance,
    required this.imageUrl,
    required this.openingHours,
    required this.rating,
    this.isFavorite = false,
  });
}

// store_provider.dart
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

  void toggleFavorite(String storeId) {
    final store = _stores.firstWhere((store) => store.id == storeId);
    store.isFavorite = !store.isFavorite;
    notifyListeners();
  }
}

// store_selection_page.dart
class _StoreSelectionPageState extends State<StoreSelectionPage> {
  TextEditingController _searchController = TextEditingController();
  List<Store> _filteredStores = [];

  @override
  void initState() {
    super.initState();
    _filteredStores = context.read<StoreProvider>().stores;
    _searchController.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    String query = _searchController.text.toLowerCase();
    setState(() {
      _filteredStores = context.read<StoreProvider>().stores.where((store) {
        return store.name.toLowerCase().contains(query);
      }).toList();
    });
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200.0,
            floating: false,
            pinned: true,
            backgroundColor: Colors.black,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'SELECT A STORE',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.white,
                    ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.grey[900]!,
                      Colors.black,
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search stores...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
                SizedBox(height: 16),
              ]),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: Consumer<StoreProvider>(
              builder: (context, storeProvider, child) {
                if (storeProvider.stores.isEmpty) {
                  return SliverFillRemaining(
                    child: Center(
                      child: CircularProgressIndicator(
                        color: Colors.black,
                      ),
                    ),
                  );
                }

                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final store = _filteredStores[index];
                      return Hero(
                        tag: 'store-${store.id}',
                        child: Card(
                          elevation: 8,
                          shadowColor: Colors.black26,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          margin: const EdgeInsets.only(bottom: 20),
                          child: InkWell(
                            onTap: () => Navigator.pop(context, store),
                            borderRadius: BorderRadius.circular(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(20),
                                    topRight: Radius.circular(20),
                                  ),
                                  child: Image.asset(
                                    store.imageUrl,
                                    height: 150,
                                    width: double.infinity,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(20),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            store.name,
                                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.w600,
                                                  letterSpacing: 1,
                                                ),
                                          ),
                                          IconButton(
                                            icon: Icon(
                                              store.isFavorite ? Icons.favorite : Icons.favorite_border,
                                              color: store.isFavorite ? Colors.red : Colors.grey,
                                            ),
                                            onPressed: () {
                                              storeProvider.toggleFavorite(store.id);
                                            },
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        store.address,
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                              color: Colors.grey[600],
                                            ),
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                                          const SizedBox(width: 8),
                                          Text(
                                            store.openingHours,
                                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                  color: Colors.grey[600],
                                                ),
                                          ),
                                          const Spacer(),
                                          Row(
                                            children: [
                                              Icon(Icons.star
                                              // HomePage.dart
class HomePage extends StatelessWidget {
  final Function(bool) onThemeToggle;

  HomePage({required this.onThemeToggle});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.grey[900]!,
              Colors.black,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'DRESS ME',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                            color: Colors.white,
                          ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: Icon(Icons.favorite, color: Colors.white),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => FavoritesPage(),
                              ),
                            );
                          },
                        ),
                        IconButton(
                          icon: Icon(Icons.brightness_6, color: Colors.white),
                          onPressed: () {
                            final isDark = Theme.of(context).brightness == Brightness.dark;
                            onThemeToggle(!isDark);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Rest of the HomePage code...
            ],
          ),
        ),
      ),
    );
  }
}