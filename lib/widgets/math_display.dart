import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class MathDisplay extends StatelessWidget {
  final String latex;
  final double fontSize;
  final Color textColor;
  final TextStyle? textStyle;

  const MathDisplay({
    super.key,
    required this.latex,
    this.fontSize = 20,
    this.textColor = Colors.black,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    try {
      return Math.tex(
        latex,
        textStyle: textStyle ?? TextStyle(
          fontSize: fontSize,
          color: textColor,
        ),
      );
    } catch (e) {
      // If LaTeX parsing fails, show error in red
      return Text(
        latex,
        style: TextStyle(
          fontSize: fontSize,
          color: Colors.red,
          fontFamily: 'monospace',
        ),
      );
    }
  }
}

class InlineMath extends StatelessWidget {
  final String latex;
  final double fontSize;
  final Color textColor;

  const InlineMath({
    super.key,
    required this.latex,
    this.fontSize = 16,
    this.textColor = Colors.black,
  });

  @override
  Widget build(BuildContext context) {
    try {
      return Math.tex(
        latex,
        textStyle: TextStyle(
          fontSize: fontSize,
          color: textColor,
        ),
      );
    } catch (e) {
      return Text(
        latex,
        style: TextStyle(
          fontSize: fontSize,
          color: Colors.red,
        ),
      );
    }
  }
}
