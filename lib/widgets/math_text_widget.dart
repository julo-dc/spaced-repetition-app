import 'package:flutter/material.dart';

class MathTextWidget extends StatelessWidget {
  final String latexString;
  final double fontSize;
  final Color textColor;
  final FontWeight fontWeight;

  const MathTextWidget({
    super.key,
    required this.latexString,
    this.fontSize = 18,
    this.textColor = Colors.black,
    this.fontWeight = FontWeight.normal,
  });

  @override
  Widget build(BuildContext context) {
    // For now, display as formatted text
    // In a real app, you'd use flutter_tex or another LaTeX renderer
    return Text(
      _formatLatex(latexString),
      style: TextStyle(
        fontSize: fontSize,
        color: textColor,
        fontWeight: fontWeight,
      ),
      textAlign: TextAlign.center,
    );
  }

  String _formatLatex(String latex) {
    // Remove $$ markers
    String cleaned = latex
        .replaceAll(r'$$', '')
        .replaceAll(r'$', '');
    
    // Handle common LaTeX commands
    cleaned = cleaned
        .replaceAll(r'\sin', 'sin')
        .replaceAll(r'\cos', 'cos')
        .replaceAll(r'\tan', 'tan')
        .replaceAll(r'\ln', 'ln')
        .replaceAll(r'\left', '')
        .replaceAll(r'\right', '')
        .replaceAll(r'\cdot', '·')
        .replaceAll(r'\\', '');
    
    // Handle superscripts - comprehensive patterns
    cleaned = cleaned
        .replaceAll(RegExp(r'\^{2}'), '²')
        .replaceAll(RegExp(r'\^{3}'), '³')
        .replaceAll(RegExp(r'\^{4}'), '⁴')
        .replaceAll(RegExp(r'\^{5}'), '⁵')
        .replaceAll(RegExp(r'\^2'), '²')
        .replaceAll(RegExp(r'\^3'), '³')
        .replaceAll(RegExp(r'\^4'), '⁴')
        .replaceAll(RegExp(r'\^5'), '⁵')
        .replaceAll(RegExp(r'\^2x'), '²x')
        .replaceAll(RegExp(r'\^3x'), '³x');
    
    // Handle e^(2x) format
    cleaned = cleaned.replaceAllMapped(
      RegExp(r'e\^([^{)]+)'),
      (match) => 'e^${match.group(1)}',
    );
    
    // Handle division format
    cleaned = cleaned.replaceAll(r'2/x', '2/x');
    
    // Handle parentheses styles
    cleaned = cleaned
        .replaceAll(r'\left(', '(')
        .replaceAll(r'\right)', ')');
    
    // Clean up extra spaces
    cleaned = cleaned.replaceAll('  ', ' ');
    
    return cleaned;
  }
}

class MathOptionWidget extends StatelessWidget {
  final String latexContent;
  final String optionId;
  final bool isSelected;
  final bool isCorrect;
  final bool hasAnswered;
  final VoidCallback onTap;

  const MathOptionWidget({
    super.key,
    required this.latexContent,
    required this.optionId,
    required this.isSelected,
    required this.isCorrect,
    required this.hasAnswered,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color? cardColor;
    if (hasAnswered && isSelected) {
      cardColor = isCorrect ? Colors.green[50] : Colors.red[50];
    } else if (hasAnswered && isCorrect) {
      cardColor = Colors.green[50];
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: cardColor,
      elevation: isSelected ? 4 : 2,
      child: InkWell(
        onTap: hasAnswered ? null : onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected
                      ? Theme.of(context).colorScheme.primary
                      : Colors.grey[300],
                ),
                child: Center(
                  child: Text(
                    optionId.toUpperCase(),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: MathTextWidget(
                  latexString: latexContent,
                  fontSize: 16,
                ),
              ),
              if (hasAnswered && isCorrect)
                const Icon(Icons.check_circle, color: Colors.green, size: 28),
              if (hasAnswered && isSelected && !isCorrect)
                const Icon(Icons.cancel, color: Colors.red, size: 28),
            ],
          ),
        ),
      ),
    );
  }
}
