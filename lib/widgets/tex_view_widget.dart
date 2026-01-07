import 'package:flutter/material.dart';
import 'package:flutter_tex/flutter_tex.dart';

class TeXViewWidget extends StatelessWidget {
  final String latexString;
  final double fontSize;
  final Color textColor;

  const TeXViewWidget({
    super.key,
    required this.latexString,
    this.fontSize = 18,
    this.textColor = Colors.black,
  });

  @override
  Widget build(BuildContext context) {
    return TeXView(
      child: TeXViewDocument(
        latexString,
        style: TeXViewStyle(
          textAlign: TeXViewTextAlign.center,
          fontStyle: TeXViewFontStyle(
            fontSize: fontSize.toInt(),
            sizeUnit: TeXViewSizeUnit.pt,
          ),
        ),
      ),
      style: TeXViewStyle(
        backgroundColor: Colors.transparent,
        contentColor: textColor,
      ),
    );
  }
}

class TeXViewInline extends StatelessWidget {
  final String latexString;
  final double fontSize;
  final Color textColor;

  const TeXViewInline({
    super.key,
    required this.latexString,
    this.fontSize = 16,
    this.textColor = Colors.black,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 60,
      child: TeXView(
        child: TeXViewDocument(
          latexString,
          style: TeXViewStyle(
            textAlign: TeXViewTextAlign.center,
            fontStyle: TeXViewFontStyle(
              fontSize: fontSize.toInt(),
              sizeUnit: TeXViewSizeUnit.pt,
            ),
          ),
        ),
        style: TeXViewStyle(
          backgroundColor: Colors.transparent,
          contentColor: textColor,
        ),
      ),
    );
  }
}
