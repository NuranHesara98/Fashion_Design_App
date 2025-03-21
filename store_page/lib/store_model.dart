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
                            final isDark =
                                Theme.of(context).brightness == Brightness.dark;
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
