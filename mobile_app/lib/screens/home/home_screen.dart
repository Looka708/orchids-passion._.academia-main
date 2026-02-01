import 'package:flutter/material.dart';

import 'package:passion_academia/models/course.dart';
import 'package:passion_academia/screens/course/course_detail_screen.dart';
import 'package:passion_academia/screens/profile/profile_screen.dart';
import 'package:passion_academia/widgets/course_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Course> _courses = [
    Course(
      id: '1',
      title: '9th Class Preparation',
      imageUrl:
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
      subjectCount: 8,
    ),
    Course(
      id: '2',
      title: 'PAF Cadet Test Prep',
      imageUrl:
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
      subjectCount: 5,
    ),
    Course(
      id: '3',
      title: 'AFNS Test Preparation',
      imageUrl:
          'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=600',
      subjectCount: 4,
    ),
    Course(
      id: '4',
      title: 'MCJ/MCM Entrance Prep',
      imageUrl:
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      subjectCount: 6,
    ),
  ];

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
        return _buildCourses();
      case 2:
        return _buildTests();
      case 3:
        return const ProfileScreen();
      default:
        return _buildHome();
    }
  }

  PreferredSizeWidget _buildAppBar(String title, {bool showProfile = true}) {
    return AppBar(
      title: title == 'Passion Academia'
          ? Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.auto_stories,
                      color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Passion',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                    Text(
                      'Academia',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ],
            )
          : Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      actions: [
        if (showProfile) ...[
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none),
          ),
          CircleAvatar(
            radius: 16,
            backgroundColor: Theme.of(context).colorScheme.secondary,
            child: Icon(Icons.person,
                size: 20, color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(width: 16),
        ],
      ],
    );
  }

  Widget _buildHome() {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: _buildAppBar('Passion Academia'),
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
                                height: 300,
                                fit: BoxFit.cover,
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

                  // Stats section (Floating style)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: _buildFloatingStatCard(
                            Icons.book_outlined,
                            '5K+',
                            'Courses',
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildFloatingStatCard(
                            Icons.play_circle_outline,
                            '2K+',
                            'Videos',
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
                          'Our Programs',
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
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _courses.length,
                      itemBuilder: (context, index) {
                        return Container(
                          width: 240,
                          margin: const EdgeInsets.symmetric(horizontal: 8),
                          child: CourseCard(
                            course: _courses[index],
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => CourseDetailScreen(
                                      course: _courses[index]),
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
                          'What Students Say',
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        const SizedBox(height: 16),
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

  Widget _buildFloatingStatCard(IconData icon, String value, String label) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTestimonialCard(String name, String role, String quote) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ...List.generate(
                  5,
                  (index) =>
                      const Icon(Icons.star, size: 16, color: Colors.amber)),
            ],
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

  Widget _buildCourses() {
    return Scaffold(
      appBar: _buildAppBar('All Programs', showProfile: false),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Explore All Courses',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Filter and find the perfect program for your academic needs.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.55,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: _courses.length,
                itemBuilder: (context, index) {
                  return CourseCard(
                    course: _courses[index],
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              CourseDetailScreen(course: _courses[index]),
                        ),
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTests() {
    final testPrepCourses =
        _courses.where((c) => c.title.toLowerCase().contains('prep')).toList();

    return Scaffold(
      appBar: _buildAppBar('Mock Tests', showProfile: false),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Entrance Test Prep',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Specialized preparation for AFNS, PAF, and Military Colleges.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.55,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: testPrepCourses.length,
                itemBuilder: (context, index) {
                  return CourseCard(
                    course: testPrepCourses[index],
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => CourseDetailScreen(
                              course: testPrepCourses[index]),
                        ),
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
