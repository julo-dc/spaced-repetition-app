// The issue is that JavaScript strings need double backslashes to produce single backslashes
// Current: "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$"
// This renders as: (f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)
// We want: (f ∘ g)'(x) = f'(g(x)) · g'(x)

// The correct strings should be:
const fixedSteps = [
  'Step 1: Identify inner function $$u = x^2$$ and outer function $$\\sin(u)$$',
  "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$",
  "Step 3: $$f'(u) = \\cos(u)$$ and $$g'(x) = 2x$$",
  'Step 4: Result: $$2x\\cos(x^2)$$',
];

console.log('Fixed Step 2:', fixedSteps[1]);
