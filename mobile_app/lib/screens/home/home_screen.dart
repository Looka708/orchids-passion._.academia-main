import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/screens/course/course_detail_screen.dart';
import 'package:passion_academia/screens/profile/profile_screen.dart';
import 'package:passion_academia/screens/course/courses_screen.dart';
import 'package:passion_academia/screens/quiz/tests_screen.dart';
import 'package:passion_academia/widgets/course_card.dart';
import 'package:passion_academia/widgets/common/app_header.dart';
import 'package:passion_academia/widgets/common/stat_card.dart';
import 'package:passion_academia/core/providers/course_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _buildPage(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Theme.of(context).brightness == Brightness.dark
            ? Colors.white60
            : Colors.black45,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.book), label: 'Courses'),
          BottomNavigationBarItem(icon: Icon(Icons.quiz), label: 'Tests'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildPage() {
    switch (_selectedIndex) {
      case 0:
        return _buildHome();
      case 1:
        return const CoursesScreen();
      case 2:
        return const TestsScreen();
      case 3:
        return const ProfileScreen();
      default:
        return _buildHome();
    }
  }

  Widget _buildHome() {
    final courseProvider = context.watch<CourseProvider>();
    final featuredCourses = courseProvider.featuredCourses;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: const AppHeader(transparent: true),
      body: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
        ),
        child: Stack(
          children: [
            // Replicate Web Gradient Orbs
            Positioned(
              top: -50,
              left: -50,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  color:
                      Theme.of(context).colorScheme.primary.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              bottom: 200,
              right: -50,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  color:
                      Theme.of(context).colorScheme.primary.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: kToolbarHeight + 40),
                  // Hero Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RichText(
                          text: TextSpan(
                            style: Theme.of(context)
                                .textTheme
                                .displaySmall
                                ?.copyWith(
                                  fontWeight: FontWeight.w900,
                                  height: 1.1,
                                ),
                            children: [
                              const TextSpan(text: 'Up Your '),
                              TextSpan(
                                text: 'Skills',
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  decoration: TextDecoration.underline,
                                  decorationColor: Theme.of(context)
                                      .colorScheme
                                      .primary
                                      .withOpacity(0.3),
                                ),
                              ),
                              const TextSpan(text: '\nTo Advance Your\n'),
                              TextSpan(
                                text: 'Career Path',
                                style: TextStyle(
                                  foreground: Paint()
                                    ..shader = LinearGradient(
                                      colors: [
                                        Theme.of(context).colorScheme.primary,
                                        const Color(0xFF66BB6A)
                                      ],
                                    ).createShader(const Rect.fromLTWH(
                                        0.0, 0.0, 200.0, 70.0)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Expert tutoring for Grades 6-12 and specialized preparation for AFNS, PAF, MCJ & MCM entrance exams.',
                          style:
                              Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodyLarge
                                        ?.color
                                        ?.withOpacity(0.7),
                                  ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => setState(() => _selectedIndex = 1),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 32),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('Get Started Today'),
                              SizedBox(width: 8),
                              Icon(Icons.chevron_right, size: 20),
                            ],
                          ),
                        ),
                        const SizedBox(height: 40),
                        // Hero Image (Matching Web)
                        Center(
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .primary
                                      .withOpacity(0.2),
                                  blurRadius: 30,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(24),
                              child: Image.asset(
                                'assets/images/main_hero.png',
                                width: double.infinity,
                                height: 220,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    height: 300,
                                    width: double.infinity,
                                    color: Theme.of(context)
                                        .colorScheme
                                        .primary
                                        .withOpacity(0.05),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.image_not_supported_outlined,
                                            size: 48,
                                            color: Theme.of(context)
                                                .colorScheme
                                                .primary
                                                .withOpacity(0.5)),
                                        const SizedBox(height: 12),
                                        Text('Experience Passion Academia',
                                            style: TextStyle(
                                                color: Theme.of(context)
                                                    .colorScheme
                                                    .primary
                                                    .withOpacity(0.5))),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 40),

                  // Stats section (Reusable StatCard usage)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Row(
                      children: [
                        const Expanded(
                          child: StatCard(
                            icon: Icons.book_outlined,
                            value: '5K+',
                            label: 'Courses',
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: StatCard(
                            icon: Icons.play_circle_outline,
                            value: '2K+',
                            label: 'Videos',
                            color: Theme.of(context).colorScheme.secondary,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 48),

                  // Programs Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Featured Programs',
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        TextButton(
                          onPressed: () => setState(() => _selectedIndex = 1),
                          child: const Text('View All'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 380,
                    child: courseProvider.isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: featuredCourses.length,
                            itemBuilder: (context, index) {
                              return Container(
                                width: 280,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 8),
                                child: CourseCard(
                                  size: CardSize.featured,
                                  course: featuredCourses[index],
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            CourseDetailScreen(
                                                course: featuredCourses[index]),
                                      ),
                                    );
                                  },
                                ),
                              );
                            },
                          ),
                  ),

                  const SizedBox(height: 48),

                  // Testimonials Section
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Student Success Stories',
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        const SizedBox(height: 24),
                        _buildTestimonialCard(
                          'Aisha K.',
                          'AFNS Aspirant',
                          'The AFNS prep course was fantastic. The mock tests were extremely helpful.',
                        ),
                        const SizedBox(height: 16),
                        _buildTestimonialCard(
                          'Bilal Ahmed',
                          'PAF Cadet',
                          'Passion Academia made my dream of joining the PAF possible.',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestimonialCard(String name, String role, String quote) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(
                5,
                (index) =>
                    const Icon(Icons.star, size: 16, color: Colors.amber)),
          ),
          const SizedBox(height: 12),
          Text(
            '“$quote”',
            style: const TextStyle(
                fontStyle: FontStyle.italic, fontSize: 15, height: 1.4),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: Theme.of(context).colorScheme.primary,
                child: Text(name[0],
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text(role,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.primary)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
