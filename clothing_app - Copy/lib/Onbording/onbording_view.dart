import 'package:clothing_app/Onbording/onboarding_items.dart';
import 'package:clothing_app/pages/login.dart';
import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Home Page"),
      ),
      body: Center(
        child: const Text("Welcome to the Home Page!"),
      ),
    );
  }
}

class OnboardingView extends StatefulWidget {
  const OnboardingView({super.key});

  @override
  State<OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<OnboardingView> {
  final controller = OnboardingItems();
  final pageController = PageController();
  int currentPage = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: PageView.builder(
                  controller: pageController,
                  itemCount: controller.items.length,
                  onPageChanged: (index) {
                    setState(() {
                      currentPage = index;
                    });
                  },
                  itemBuilder: (context, index) { 
                    final item = controller.items[index];
                    return Column(
                      children: [
                        Flexible(
                          flex: 3,
                          child: FractionallySizedBox(
                            widthFactor: 1.0,
                            child: Image.asset(
                              item.image,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        // Add the title here in bold and colored text
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          child: Text(
                            item.title,
                            style: const TextStyle(
                              fontSize: 24.0,
                              fontWeight: FontWeight.bold,
                              color: Colors.black, // Customize title color here
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Flexible(
                          flex: 1,
                          child: Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 16.0),
                            child: SingleChildScrollView(
                              child: Text(
                                item.description,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(fontSize: 16.0),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  controller.items.length,
                  (index) => AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 4.0),
                    height: 8.0,
                    width: currentPage == index ? 16.0 : 8.0,
                    decoration: BoxDecoration(
                      color: currentPage == index
                          ? const Color.fromARGB(255, 0, 0, 0)
                          : Colors.grey,
                      borderRadius: BorderRadius.circular(4.0),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: SizedBox(
                  width: double.infinity,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            Colors.black, // Set the button color to black
                        foregroundColor:
                            Colors.white, // Set the text color to white
                      ),
                      onPressed: () {
                        if (currentPage < controller.items.length - 1) {
                          pageController.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        } else {
                          // Navigate to the new page (HomePage) instead of SplashScreen
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const LoginPage()),
                          );
                        }
                      },
                      child: Text(
                        currentPage < controller.items.length - 1
                            ? "Next"
                            : "Finish",
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          // Add "Skip" button at the top-right corner
          Positioned(
            top: 40.0,
            right: 16.0,
            child: TextButton(
              onPressed: () {
                pageController.jumpToPage(controller.items.length - 1);
              },
              child: const Text(
                "Skip",
                style: TextStyle(
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                  color: Color.fromARGB(255, 223, 219, 219),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
