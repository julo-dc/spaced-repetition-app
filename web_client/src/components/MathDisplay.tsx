'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathDisplayProps {
  latex: string;
  block?: boolean;
  className?: string;
}

/**
 * Renders a single LaTeX expression.
 * Strips delimiters ($ or $$) before passing to KaTeX.
 */
export function MathDisplay({ latex, block = false, className = '' }: MathDisplayProps) {
  if (!latex) return null;

  try {
    // 1. Thoroughly strip any wrapping delimiters ($ or $$)
    let processed = latex.trim();
    
    // Aggressively remove leading and trailing dollar signs
    // We use a regex that handles one or more dollar signs
    processed = processed.replace(/^[\$]+|[\$]+$/g, '').trim();

    // Normalize common unicode math symbols to LaTeX commands
    processed = processed
      .replace(/∘/g, '\\circ')
      .replace(/·/g, '\\cdot');

    // 2. Auto-fix common missing backslashes for standard math functions
    // (KaTeX requires \sin, \cos, etc.)
    const functions = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'ln', 'log', 'exp', 'lim', 'sqrt'];
    functions.forEach(fn => {
      // Replace instances of 'fn' not preceded by a backslash
      const regex = new RegExp(`(^|[^\\\\])\\b${fn}\\b`, 'g');
      processed = processed.replace(regex, `$1\\${fn}`);
    });

    if (block) {
      return (
        <div className={`math-display py-4 overflow-x-auto text-center ${className}`}>
          <BlockMath math={processed} errorColor={'#4f46e5'} />
        </div>
      );
    }

    return (
      <span className={`math-inline inline-flex items-center ${className}`}>
        <InlineMath math={processed} errorColor={'#4f46e5'} />
      </span>
    );
  } catch (error) {
    console.error('KaTeX render error:', error, 'for input:', latex);
    // Ultimate fallback: show text without delimiters, styled consistently
    const cleanRaw = latex.replace(/\$/g, '').trim();
    return (
      <span className={`text-indigo-600 font-medium italic ${className}`}>
        {cleanRaw}
      </span>
    );
  }
}

interface QuestionTextProps {
  text: string;
  className?: string;
}

/**
 * Renders mixed text and LaTeX.
 * Expects math to be wrapped in $...$ or $$...$$.
 * If delimiters are missing but raw LaTeX commands are found, it attempts a best-effort render.
 */
export function QuestionText({ text, className = '' }: QuestionTextProps) {
  if (!text) return null;

  // 1. Try to split by explicit delimiters first
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  if (parts.length > 1) {
    return (
      <div className={`flex flex-wrap items-center justify-start gap-x-1 w-full ${className}`}>
        {parts.map((part, index) => {
          if (!part) return null;
          if (part.startsWith('$')) {
            return <MathDisplay key={index} latex={part} className="text-indigo-700 font-bold" />;
          }
          return <span key={index} className="text-gray-800">{part}</span>;
        })}
      </div>
    );
  }

  // 2. Check for chain rule pattern specifically
  const chainRuleRegex = /\(f \\circ g\)'\(x\) = f'\(g\(x\)\) \\cdot g'\(x\)/;
  
  if (chainRuleRegex.test(text)) {
    // This is the chain rule, wrap the whole thing in $$ delimiters
    const mathPart = text.replace(/.*?(\(f \\circ g\)'\(x\) = f'\(g\(x\)\) \\cdot g'\(x\)).*/, '$$1$$');
    const prefix = text.replace(/\(f \\circ g\)'\(x\) = f'\(g\(x\)\) \\cdot g'\(x\).*/, '').replace(/:\s*$/, '');
    
    return (
      <div className={`flex flex-wrap items-center justify-start gap-x-1 w-full ${className}`}>
        {prefix && <span className="text-gray-800">{prefix}: </span>}
        <MathDisplay latex={mathPart} className="text-indigo-700 font-bold" />
      </div>
    );
  }
  
  // 3. If no delimiters, check for raw LaTeX commands (\tan, \frac, etc.)
  const latexCommandRegex = /\\(tan|sin|cos|frac|left|right|sqrt|alpha|beta|gamma|theta|pi|sum|int|partial|nabla|delta|Delta|cdot|times|div|exp|ln|log|lim|circ)/;
  
  if (latexCommandRegex.test(text)) {
    const match = text.match(latexCommandRegex);
    if (match && match.index !== undefined) {
      // Strategy: Look for natural split points like colons or "in" before the math
      const textBeforeMatch = text.substring(0, match.index);
      
      // Try to find a colon as a natural separator
      const colonIndex = textBeforeMatch.lastIndexOf(':');
      // Try to find " in " as a natural separator (e.g., "function in $$...")
      const inIndex = textBeforeMatch.lastIndexOf(' in ');
      
      // Use the best split point: colon, " in ", or last space
      let splitIndex = match.index;
      if (colonIndex !== -1 && colonIndex > textBeforeMatch.length - 10) {
        splitIndex = colonIndex + 1; // Include colon in prefix
      } else if (inIndex !== -1 && inIndex > textBeforeMatch.length - 20) {
        splitIndex = inIndex + 4; // Skip " in "
      } else {
        const lastSpace = textBeforeMatch.lastIndexOf(' ');
        if (lastSpace !== -1) {
          splitIndex = lastSpace;
        }
      }
      
      const prefix = text.substring(0, splitIndex).trim();
      const mathPart = text.substring(splitIndex).trim();
      
      return (
        <div className={`flex flex-wrap items-center justify-start gap-x-1 w-full ${className}`}>
          {prefix && <span className="text-gray-800">{prefix}</span>}
          <MathDisplay latex={mathPart} className="text-indigo-700 font-bold" />
        </div>
      );
    }
  }

  // 3. Fallback: plain text
  return <div className={`text-gray-800 text-left w-full ${className}`}>{text}</div>;
}
