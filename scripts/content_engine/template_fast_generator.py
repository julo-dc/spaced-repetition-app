"""
Template-based Math Question Generator - Fast bulk generation without LLM.

Generates questions using pure SymPy with pre-defined solution templates.
Speed: ~100 questions/second (vs 1 question/second with LLM).
"""

import random
import sympy as sp
from sympy import symbols, sin, cos, tan, exp, log, diff, latex
from typing import List, Dict, Any
import hashlib


class TemplateFastGenerator:
    """
    High-speed question generator using templates instead of LLM calls.
    Designed for bulk generation of 10K+ questions.
    """
    
    def __init__(self):
        self.x = symbols('x')
        
        # Pre-defined solution templates by topic
        self.templates = {
            'chain_rule': [
                "Step 1: Identify the outer function $$f(u)$$ and inner function $$u = g(x)$$ in $${original}$$",
                "Step 2: Apply the Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$",
                "Step 3: Compute $$f'(u)$$ and $$g'(x)$$",
                "Step 4: Substitute and simplify to get $${derivative}$$"
            ],
            'product_rule': [
                "Step 1: Identify $$f(x)$$ and $$g(x)$$ in the product $${original}$$",
                "Step 2: Apply the Product Rule: $$(fg)' = f'g + fg'$$",
                "Step 3: Compute $$f'(x)$$ and $$g'(x)$$",
                "Step 4: Simplify to get $${derivative}$$"
            ],
            'quotient_rule': [
                "Step 1: Identify numerator $$f(x)$$ and denominator $$g(x)$$ in $${original}$$",
                "Step 2: Apply the Quotient Rule: $$(f/g)' = (f'g - fg')/g^2$$",
                "Step 3: Compute derivatives and substitute",
                "Step 4: Simplify to get $${derivative}$$"
            ],
            'basic': [
                "Step 1: Start with $$f(x) = {original}$$",
                "Step 2: Apply standard differentiation rules",
                "Step 3: Simplify to get $$f'(x) = {derivative}$$"
            ]
        }
    
    def _generate_random_function(self, topic: str, variation: int = 0) -> sp.Expr:
        """
        Generate random function with controlled variation.
        variation parameter allows generating diverse questions in batch.
        """
        random.seed(variation)  # Deterministic but diverse
        
        if 'chain' in topic.lower():
            outer_funcs = [sin, cos, tan, exp, log]
            inner_funcs = [
                self.x**2, self.x**3, 2*self.x + 1, 3*self.x**2,
                self.x**2 + self.x, self.x**3 + 2*self.x, 
                4*self.x - 1, self.x**2 - 3
            ]
            outer = outer_funcs[variation % len(outer_funcs)]
            inner = inner_funcs[(variation // len(outer_funcs)) % len(inner_funcs)]
            return outer(inner)
        
        elif 'product' in topic.lower():
            combinations = [
                (self.x**2, sin(self.x)), (self.x**3, cos(self.x)),
                (self.x, exp(self.x)), (self.x**2, exp(self.x)),
                (sin(self.x), cos(self.x)), (self.x, log(self.x)),
                (self.x**2, log(self.x)), (self.x**3, sin(self.x))
            ]
            f, g = combinations[variation % len(combinations)]
            return f * g
        
        elif 'quotient' in topic.lower():
            numerators = [self.x**2, sin(self.x), self.x**3, exp(self.x), self.x, 2*self.x**2]
            denominators = [self.x, cos(self.x), self.x**2, self.x + 1, exp(self.x), self.x**3]
            num = numerators[variation % len(numerators)]
            den = denominators[(variation // len(numerators)) % len(denominators)]
            return num / den
        
        else:  # Basic derivatives
            funcs = [
                self.x**2, self.x**3 + 2*self.x, sin(self.x), cos(self.x),
                exp(self.x), log(self.x), self.x**4, tan(self.x)
            ]
            return funcs[variation % len(funcs)]
    
    def _compute_derivative(self, function: sp.Expr) -> sp.Expr:
        """Compute derivative using SymPy (source of truth)"""
        return sp.simplify(diff(function, self.x))
    
    def _generate_distractors(self, correct: sp.Expr, function: sp.Expr) -> List[sp.Expr]:
        """Generate plausible incorrect answers"""
        distractors = []
        
        # Common student mistakes
        missing_chain = diff(function.subs(self.x, function), self.x) if len(str(function)) > 5 else correct + 1
        sign_error = -correct
        missing_factor = correct / 2 if correct != 0 else correct + self.x
        extra_derivative = diff(correct, self.x) if correct != 0 else correct * 2
        
        candidates = [missing_chain, sign_error, missing_factor, extra_derivative]
        
        for candidate in candidates:
            simplified = sp.simplify(candidate)
            if simplified != correct and simplified not in distractors:
                distractors.append(simplified)
                if len(distractors) >= 3:
                    break
        
        # Fill remaining with variations
        while len(distractors) < 3:
            noise = random.choice([2, -2, self.x, -self.x])
            distractor = sp.simplify(correct + noise)
            if distractor != correct and distractor not in distractors:
                distractors.append(distractor)
        
        return distractors[:3]
    
    def _format_solution_steps(self, topic: str, original: sp.Expr, derivative: sp.Expr) -> List[str]:
        """Format pre-defined templates with actual expressions"""
        topic_key = 'chain_rule' if 'chain' in topic.lower() else \
                    'product_rule' if 'product' in topic.lower() else \
                    'quotient_rule' if 'quotient' in topic.lower() else 'basic'
        
        template = self.templates[topic_key]
        
        return [
            step.replace('{original}', latex(original))
                .replace('{derivative}', latex(derivative))
            for step in template
        ]
    
    def generate_question(self, topic: str, variation: int = 0) -> Dict[str, Any]:
        """Generate a single verified question using templates"""
        function = self._generate_random_function(topic, variation)
        derivative = self._compute_derivative(function)
        distractors = self._generate_distractors(derivative, function)
        solution_steps = self._format_solution_steps(topic, function, derivative)
        
        # Build options
        options = [
            {"id": "a", "latex": latex(derivative), "is_correct": True}
        ]
        
        for i, dist in enumerate(distractors):
            options.append({
                "id": chr(98 + i),  # 'b', 'c', 'd'
                "latex": latex(dist),
                "is_correct": False
            })
        
        random.shuffle(options)
        
        # Ensure at least one option is marked correct
        if not any(opt["is_correct"] for opt in options):
            options[0]["is_correct"] = True
        
        content = {
            "statement": f"Find the derivative of $$f(x) = {latex(function)}$$",
            "options": options,
            "solution_steps": solution_steps
        }
        
        return content
    
    def generate_batch(self, topic: str, count: int) -> List[Dict[str, Any]]:
        """Generate large batch of questions efficiently"""
        questions = []
        
        for i in range(count):
            try:
                question = self.generate_question(topic, variation=i)
                questions.append(question)
                
                if (i + 1) % 100 == 0:
                    print(f"Generated {i + 1}/{count} questions")
            
            except Exception as e:
                print(f"Failed to generate question {i + 1}: {e}")
        
        return questions
    
    def compute_content_hash(self, question: Dict[str, Any]) -> str:
        """Generate hash for deduplication"""
        content_str = str(question['statement']) + str(sorted(
            opt['latex'] for opt in question['options']
        ))
        return hashlib.md5(content_str.encode()).hexdigest()


if __name__ == '__main__':
    # Quick test
    gen = TemplateFastGenerator()
    
    print("Generating 10 Chain Rule questions...")
    questions = gen.generate_batch("Chain Rule", 10)
    
    print(f"\nGenerated {len(questions)} questions")
    print("\nSample question:")
    import json
    print(json.dumps(questions[0], indent=2))
