import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/screens/course/course_detail_screen.dart';
import 'package:passion_academia/screens/profile/profile_screen.dart';
import 'package:passion_academia/screens/course/courses_screen.dart';
import 'package:passion_academia/screens/quiz/tests_screen.dart';
import 'package:passion_academia/widgets/course_card.dart';
import 'package:passion_academia/widgets/common/app_header.dart';
import 'package:passion_academia/widgets/common/stat_card.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';
import 'package:passion_academia/core/providers/course_provider.dart';
import 'package:passion_academia/widgets/home/xp_progress_bar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _selectedIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        children: [
          _buildHome(),
          const CoursesScreen(),
          const TestsScreen(),
          const ProfileScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          _pageController.animateToPage(
            index,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
          );
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

  Widget _buildHome() {
    final courseProvider = context.watch<CourseProvider>();
    final authProvider = context.watch<AuthProvider>();
    final featuredCourses = courseProvider.featuredCourses;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppHeader(
        transparent: true,
        onSearch: () => _pageController.animateToPage(1,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut),
      ),
      body: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
        ),
        child: Stack(
          children: [
            // Replicate Web Gradient Orbs
            Positioned(
              top: -100,
              right: -50,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  color:
                      Theme.of(context).colorScheme.primary.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: kToolbarHeight + 32),
                  // Welcome & XP Progress
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hello, ${authProvider.userName?.split(' ')[0]}! 👋',
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        const SizedBox(height: 12),
                        XPProgressBar(
                          level: authProvider.userLevel,
                          currentXP: authProvider.userXP,
                          nextLevelXP: authProvider.xpForNextLevel,
                          progress: authProvider.levelProgress,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Recommended for You (AI Suggestions Replacement)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Theme.of(context)
                                    .colorScheme
                                    .primary
                                    .withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                Icons.auto_awesome_rounded,
                                size: 16,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Recommended for You',
                              style: Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 110,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: featuredCourses.length.clamp(0, 3),
                            itemBuilder: (context, index) {
                              final course = featuredCourses[index];
                              return Container(
                                width: 280,
                                margin: const EdgeInsets.only(right: 12),
                                child: CourseCard(
                                  size: CardSize.compact,
                                  course: course,
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            CourseDetailScreen(course: course),
                                      ),
                                    );
                                  },
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 48),
                  // Hero Section (Discovery Title)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RichText(
// ...
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

                  const SizedBox(height: 48),

                  // Discover Topics (Search & Discovery)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Discover Topics',
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildTopicChip(context, 'AFNS',
                                Icons.medical_services_outlined),
                            _buildTopicChip(
                                context, 'PAF', Icons.airplanemode_active),
                            _buildTopicChip(context, 'Biology', Icons.biotech),
                            _buildTopicChip(context, 'Physics', Icons.bolt),
                            _buildTopicChip(
                                context, 'English', Icons.translate),
                            _buildTopicChip(context, 'Math', Icons.calculate),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 48),

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

  Widget _buildTopicChip(BuildContext context, String label, IconData icon) {
    return GestureDetector(
      onTap: () {
        // For now, just navigate to Courses tab
        _pageController.animateToPage(
          1,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
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
