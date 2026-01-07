import random
from typing import List, Dict, Any
import sympy as sp
from sympy import symbols, sin, cos, tan, exp, log, diff, latex
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os


class MathGenerator:
    """
    Generates verified math questions using SymPy as the source of truth.
    LLM is only used for generating human-readable solution steps.
    """
    
    def __init__(self):
        self.x = symbols('x')
        self.llm = None
        
        if os.getenv('OPENAI_API_KEY'):
            self.llm = ChatOpenAI(model="gpt-4", temperature=0.7)
    
    def _generate_random_function(self, topic: str) -> sp.Expr:
        """Generate a random function based on the topic."""
        
        if topic.lower() in ["chain rule", "chain_rule", "chainrule"]:
            outer_funcs = [sin, cos, tan, exp]
            inner_funcs = [
                self.x**2,
                self.x**3,
                2*self.x + 1,
                3*self.x**2 + 2,
                self.x**2 + self.x,
            ]
            
            outer = random.choice(outer_funcs)
            inner = random.choice(inner_funcs)
            return outer(inner)
        
        elif topic.lower() in ["product rule", "product_rule", "productrule"]:
            funcs = [
                (self.x**2, sin(self.x)),
                (self.x**3, cos(self.x)),
                (self.x, exp(self.x)),
                (self.x**2, exp(self.x)),
                (sin(self.x), cos(self.x)),
            ]
            f, g = random.choice(funcs)
            return f * g
        
        elif topic.lower() in ["quotient rule", "quotient_rule", "quotientrule"]:
            numerators = [self.x**2, sin(self.x), self.x**3, exp(self.x)]
            denominators = [self.x, cos(self.x), self.x**2, self.x + 1]
            
            num = random.choice(numerators)
            den = random.choice(denominators)
            return num / den
        
        else:
            funcs = [
                self.x**2,
                self.x**3 + 2*self.x,
                sin(self.x),
                cos(self.x),
                exp(self.x),
                self.x**2 + 3*self.x + 2,
            ]
            return random.choice(funcs)
    
    def _compute_derivative(self, function: sp.Expr) -> sp.Expr:
        """Compute the derivative using SymPy (source of truth)."""
        return diff(function, self.x)
    
    def _generate_distractors(self, correct_answer: sp.Expr, count: int = 3) -> List[sp.Expr]:
        """Generate mathematically plausible but incorrect answers."""
        distractors = []
        
        distractor_1 = correct_answer + 1
        distractor_2 = correct_answer * (-1)
        distractor_3 = diff(correct_answer, self.x) if count > 2 else correct_answer / 2
        distractor_4 = correct_answer.subs(self.x, 2*self.x) if count > 3 else correct_answer + self.x
        
        candidates = [distractor_1, distractor_2, distractor_3, distractor_4]
        
        for candidate in candidates[:count]:
            simplified = sp.simplify(candidate)
            if simplified != correct_answer:
                distractors.append(simplified)
        
        while len(distractors) < count:
            noise = random.choice([1, -1, 2, -2])
            distractor = correct_answer + noise
            if distractor not in distractors and distractor != correct_answer:
                distractors.append(distractor)
        
        return distractors[:count]
    
    def _generate_solution_steps(self, function: sp.Expr, derivative: sp.Expr, topic: str) -> List[str]:
        """Generate human-readable solution steps using LLM if available, otherwise use template."""
        
        if self.llm:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are a calculus tutor. Generate 3-4 clear, concise solution steps."),
                    ("user", 
                     f"Topic: {topic}\n"
                     f"Function: f(x) = {sp.latex(function)}\n"
                     f"Derivative: f'(x) = {sp.latex(derivative)}\n\n"
                     f"Provide step-by-step solution as a JSON array of strings."
                    )
                ])
                
                chain = prompt | self.llm
                response = chain.invoke({})
                
                import json
                steps = json.loads(response.content)
                return steps if isinstance(steps, list) else [response.content]
            
            except Exception as e:
                print(f"LLM generation failed: {e}. Using template.")
        
        if "chain" in topic.lower():
            return [
                f"Identify the outer function and inner function in {sp.latex(function)}",
                "Apply the Chain Rule: (f ∘ g)'(x) = f'(g(x)) · g'(x)",
                f"Compute the derivative: {sp.latex(derivative)}"
            ]
        else:
            return [
                f"Start with f(x) = {sp.latex(function)}",
                "Apply differentiation rules",
                f"Simplify to get f'(x) = {sp.latex(derivative)}"
            ]
    
    def generate_question(self, topic: str) -> Dict[str, Any]:
        """Generate a single verified math question."""
        
        function = self._generate_random_function(topic)
        correct_derivative = self._compute_derivative(function)
        distractors = self._generate_distractors(correct_derivative, count=3)
        solution_steps = self._generate_solution_steps(function, correct_derivative, topic)
        
        options = [
            {
                "id": "a",
                "latex": sp.latex(correct_derivative),
                "is_correct": True
            }
        ]
        
        for i, distractor in enumerate(distractors):
            options.append({
                "id": chr(98 + i),
                "latex": sp.latex(distractor),
                "is_correct": False
            })
        
        random.shuffle(options)
        
        correct_option = next(opt for opt in options if opt["is_correct"])
        correct_option["is_correct"] = True
        
        content = {
            "statement": f"Find the derivative of $$f(x) = {sp.latex(function)}$$",
            "options": options,
            "solution_steps": solution_steps
        }
        
        return content
    
    def generate_batch(self, topic: str, count: int) -> List[Dict[str, Any]]:
        """Generate multiple questions for a topic."""
        questions = []
        
        for i in range(count):
            try:
                question = self.generate_question(topic)
                questions.append(question)
                print(f"Generated question {i+1}/{count} for topic '{topic}'")
            except Exception as e:
                print(f"Failed to generate question {i+1}: {e}")
        
        return questions
