'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathDisplayProps {
  latex: string;
  block?: boolean;
  className?: string;
}

export function MathDisplay({ latex, block = false, className = '' }: MathDisplayProps) {
  try {
    // Clean LaTeX: remove backslashes from function names for proper rendering
    const cleanedLatex = latex
      .replace(/\\sin/g, 'sin')
      .replace(/\\cos/g, 'cos')
      .replace(/\\tan/g, 'tan')
      .replace(/\\ln/g, 'ln');

    if (block) {
      return (
        <div className={`math-display ${className}`}>
          <BlockMath math={cleanedLatex} />
        </div>
      );
    }

    return (
      <span className={`math-inline ${className}`}>
        <InlineMath math={cleanedLatex} />
      </span>
    );
  } catch (error) {
    console.error('Math rendering error:', error);
    return (
      <span className={`text-red-500 font-mono ${className}`}>
        {latex}
      </span>
    );
  }
}

interface QuestionTextProps {
  text: string;
  className?: string;
}

export function QuestionText({ text, className = '' }: QuestionTextProps) {
  // Handle derivative questions specially
  if (text.includes('Find the derivative of f(x) =')) {
    const regex = /(.*?)(f\(x\) = .*)/;
    const match = text.match(regex);

    if (match) {
      const prefix = match[1]; // "Find the derivative of "
      const mathPart = match[2]; // "f(x) = sin(x^2)"

      return (
        <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
          <span className="text-lg">{prefix}</span>
          <MathDisplay latex={mathPart} />
        </div>
      );
    }
  }

  return (
    <div className={className}>
      <MathDisplay latex={text} />
    </div>
  );
}
