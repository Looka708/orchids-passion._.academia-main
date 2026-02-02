import 'package:flutter/material.dart';

class InfinityLoader extends StatefulWidget {
  final String message;
  final double size;
  final Color? color;

  const InfinityLoader({
    super.key,
    this.message = 'Loading...',
    this.size = 60,
    this.color,
  });

  @override
  State<InfinityLoader> createState() => _InfinityLoaderState();
}

class _InfinityLoaderState extends State<InfinityLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    // 2-second cycle for the moving line
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = widget.color ?? Theme.of(context).colorScheme.primary;

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CustomPaint(
            size: Size(widget.size * 2, widget.size),
            painter: InfinityPainter(
              animation: _controller,
              color: primaryColor,
            ),
          ),
          if (widget.message.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text(
              widget.message,
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: 16,
                fontWeight: FontWeight.w500,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class InfinityPainter extends CustomPainter {
  final Animation<double> animation;
  final Color color;

  InfinityPainter({required this.animation, required this.color})
      : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.round;

    final path = Path();
    final width = size.width;
    final height = size.height;
    final cy = height / 2;
    final quarter = width / 4;

    // Draw the static infinity symbol background
    path.moveTo(quarter * 2, cy);
    // Right loop
    path.cubicTo(
        quarter * 3, cy - height / 2, width, cy - height / 2, width, cy);
    path.cubicTo(
        width, cy + height / 2, quarter * 3, cy + height / 2, quarter * 2, cy);
    // Left loop
    path.cubicTo(quarter, cy - height / 2, 0, cy - height / 2, 0, cy);
    path.cubicTo(0, cy + height / 2, quarter, cy + height / 2, quarter * 2, cy);

    canvas.drawPath(path, paint);

    // Draw the moving green line (Progress)
    final progressPaint = Paint()
      ..color = const Color(0xFF66BB6A) // Bright Green
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.round;

    // Create a path metric to calculate the position along the path
    final pathMetric = path.computeMetrics().first;
    final totalLength = pathMetric.length;

    // The length of the moving segment (25% of total)
    const segmentPercentage = 0.25;
    final segmentLength = totalLength * segmentPercentage;

    // Current starting position based on animation (0.0 to 1.0)
    double currentPos = animation.value * totalLength;

    // Extract the path segment
    // We handle the wrap-around logic manually
    Path extractPath =
        pathMetric.extractPath(currentPos, currentPos + segmentLength);

    // If the segment wraps around the end, draw the remaining part from the start
    if (currentPos + segmentLength > totalLength) {
      final remaining = (currentPos + segmentLength) - totalLength;
      extractPath.addPath(pathMetric.extractPath(0, remaining), Offset.zero);
    }

    canvas.drawPath(extractPath, progressPaint);

    // Add a glowing effect to the head of the line
    final endPos = (currentPos + segmentLength) % totalLength;
    final tangent = pathMetric.getTangentForOffset(endPos);

    if (tangent != null) {
      final glowPaint = Paint()
        ..color = const Color(0xFF66BB6A).withOpacity(0.6)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);

      canvas.drawCircle(tangent.position, 8, glowPaint);

      // Draw a bright dot at the head
      canvas.drawCircle(tangent.position, 3, Paint()..color = Colors.white);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
