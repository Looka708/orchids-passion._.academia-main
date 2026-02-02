import 'package:flutter/material.dart';
import 'package:passion_academia/models/course.dart';

enum CardSize { compact, standard, featured }

class CourseCard extends StatelessWidget {
  final Course course;
  final VoidCallback? onTap;
  final CardSize size;

  const CourseCard({
    super.key,
    required this.course,
    this.onTap,
    this.size = CardSize.standard,
  });

  @override
  Widget build(BuildContext context) {
    if (size == CardSize.compact) {
      return _buildCompact(context);
    }
    return _buildStandard(context);
  }

  Widget _buildImage(BuildContext context,
      {double? width, double? height, BoxFit fit = BoxFit.cover}) {
    final bool isAsset = course.imageUrl.startsWith('assets/');

    if (isAsset) {
      return Image.asset(
        course.imageUrl,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (context, error, stackTrace) =>
            _buildErrorImage(context, width, height),
      );
    }

    return Image.network(
      course.imageUrl,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) =>
          _buildErrorImage(context, width, height),
    );
  }

  Widget _buildErrorImage(BuildContext context, double? width, double? height) {
    return Container(
      width: width,
      height: height,
      color: Theme.of(context).colorScheme.secondary,
      child: Icon(Icons.school,
          size: (width != null && width < 100) ? 24 : 48,
          color: Theme.of(context).colorScheme.primary),
    );
  }

  Widget _buildCompact(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: _buildImage(context, width: 80, height: 80),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course.title,
                      style: Theme.of(context)
                          .textTheme
                          .titleSmall
                          ?.copyWith(fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${course.subjectCount} Subjects • ${course.rating} ★',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStandard(BuildContext context) {
    final isFeatured = size == CardSize.featured;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: isFeatured ? 21 / 9 : 16 / 9,
              child: _buildImage(context),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Theme.of(context)
                          .colorScheme
                          .primary
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      course.category.toUpperCase(),
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    course.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (isFeatured) ...[
                    const SizedBox(height: 8),
                    Text(
                      course.description,
                      style: Theme.of(context).textTheme.bodySmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.people_outline,
                              size: 14,
                              color:
                                  Theme.of(context).textTheme.bodySmall?.color),
                          const SizedBox(width: 4),
                          Text(
                            '${course.students > 1000 ? (course.students / 1000).toStringAsFixed(1) + 'k' : course.students} Students',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star, size: 14, color: Colors.amber),
                          const SizedBox(width: 4),
                          Text(
                            course.rating.toString(),
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                    color: Colors.amber,
                                    fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: onTap,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 0),
                        minimumSize: const Size(0, 40),
                        textStyle: const TextStyle(fontSize: 12),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('View Program'),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward, size: 14),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
