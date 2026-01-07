import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class MixedText extends StatelessWidget {
  final String text;
  final double fontSize;
  final Color textColor;
  final TextStyle? textStyle;

  const MixedText({
    super.key,
    required this.text,
    this.fontSize = 20,
    this.textColor = Colors.black,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    // Split the text by LaTeX patterns
    final parts = _splitText(text);
    final children = <Widget>[];

    for (int i = 0; i < parts.length; i++) {
      final part = parts[i];
      
      if (part.isLatex) {
        // Render as LaTeX
        children.add(
          Math.tex(
            part.content,
            textStyle: textStyle ?? TextStyle(
              fontSize: fontSize,
              color: textColor,
            ),
          ),
        );
      } else {
        // Render as regular text
        children.add(
          Text(
            part.content,
            style: textStyle ?? TextStyle(
              fontSize: fontSize,
              color: textColor,
            ),
          ),
        );
      }
    }

    return Wrap(
      children: children,
      crossAxisAlignment: WrapCrossAlignment.center,
    );
  }

  List<TextPart> _splitText(String text) {
    final parts = <TextPart>[];
    
    // Simple approach: split on backslash which indicates LaTeX
    final segments = text.split(r'\');
    
    if (segments.isNotEmpty) {
      // First segment is always text
      parts.add(TextPart(
        content: segments[0],
        isLatex: false,
      ));
      
      // Process remaining segments
      for (int i = 1; i < segments.length; i++) {
        final segment = segments[i];
        if (segment.isEmpty) continue;
        
        // Find the end of the LaTeX command
        final braceIndex = segment.indexOf('{');
        if (braceIndex != -1) {
          final command = segment.substring(0, braceIndex);
          final content = segment.substring(braceIndex);
          
          // Add the LaTeX part
          parts.add(TextPart(
            content: r'\$' + command + content + r'\$',
            isLatex: true,
          ));
          
          // Add any remaining text after the closing brace
          final closingIndex = content.indexOf('}');
          if (closingIndex != -1 && closingIndex + 1 < content.length) {
            parts.add(TextPart(
              content: content.substring(closingIndex + 1),
              isLatex: false,
            ));
          }
        } else {
          // No braces found, treat as text
          parts.add(TextPart(
            content: segment,
            isLatex: false,
          ));
        }
      }
    }
    
    return parts;
  }
}

class TextPart {
  final String content;
  final bool isLatex;

  TextPart({
    required this.content,
    required this.isLatex,
  });
}

class InlineMixedText extends StatelessWidget {
  final String text;
  final double fontSize;
  final Color textColor;

  const InlineMixedText({
    super.key,
    required this.text,
    this.fontSize = 18,
    this.textColor = Colors.black,
  });

  @override
  Widget build(BuildContext context) {
    final parts = _splitText(text);
    final children = <Widget>[];

    for (int i = 0; i < parts.length; i++) {
      final part = parts[i];
      
      if (part.isLatex) {
        children.add(
          Math.tex(
            part.content,
            textStyle: TextStyle(
              fontSize: fontSize,
              color: textColor,
            ),
          ),
        );
      } else {
        children.add(
          Text(
            part.content,
            style: TextStyle(
              fontSize: fontSize,
              color: textColor,
            ),
          ),
        );
      }
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: children,
      crossAxisAlignment: CrossAxisAlignment.center,
    );
  }

  List<TextPart> _splitText(String text) {
    final parts = <TextPart>[];
    final regex = RegExp(r'\\[a-zA-Z]+\{[^}]*\}|\$[^$]*\$|[^\\$]+');
    
    int lastEnd = 0;
    for (final match in regex.allMatches(text)) {
      if (match.start > lastEnd) {
        parts.add(TextPart(
          content: text.substring(lastEnd, match.start),
          isLatex: false,
        ));
      }
      
      parts.add(TextPart(
        content: match.group(0)!,
        isLatex: true,
      ));
      
      lastEnd = match.end;
    }
    
    if (lastEnd < text.length) {
      parts.add(TextPart(
        content: text.substring(lastEnd),
        isLatex: false,
      ));
    }
    
    return parts;
  }
}
