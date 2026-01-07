import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class QuestionText extends StatelessWidget {
  final String text;
  final double fontSize;
  final Color textColor;

  const QuestionText({
    super.key,
    required this.text,
    this.fontSize = 22,
    this.textColor = Colors.black,
  });

  @override
  Widget build(BuildContext context) {
    // Handle specific question patterns
    if (text.contains('Find the derivative of f(x) =')) {
      return _buildDerivativeQuestion();
    }
    
    // Fallback to regular text
    return Text(
      text,
      style: TextStyle(
        fontSize: fontSize,
        color: textColor,
      ),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildDerivativeQuestion() {
    // Use regex to find "f(x) =" and everything after it
    final regex = RegExp(r'(.*?)(f\(x\) = .*)');
    final match = regex.firstMatch(text);
    
    if (match == null) {
      return Text(
        text,
        style: TextStyle(
          fontSize: fontSize,
          color: textColor,
        ),
        textAlign: TextAlign.center,
      );
    }

    final prefix = match.group(1)!; // "Find the derivative of "
    var mathPart = match.group(2)!; // "f(x) = sin(x^2)"

    // Clean backslashes from LaTeX commands in the math part
    mathPart = mathPart.replaceAll(r'\sin', r'sin')
                      .replaceAll(r'\cos', r'cos')
                      .replaceAll(r'\tan', r'tan')
                      .replaceAll(r'\ln', r'ln')
                      .replaceAll(r'\frac{', r'\frac{'); // Keep frac for math rendering

    return Wrap(
      alignment: WrapAlignment.center,
      children: [
        Text(
          prefix,
          style: TextStyle(
            fontSize: fontSize,
            color: textColor,
          ),
        ),
        Math.tex(
          mathPart,
          textStyle: TextStyle(
            fontSize: fontSize,
            color: textColor,
          ),
        ),
      ],
    );
  }
}

class OptionText extends StatelessWidget {
  final String latex;
  final double fontSize;
  final Color textColor;

  const OptionText({
    super.key,
    required this.latex,
    this.fontSize = 18,
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
