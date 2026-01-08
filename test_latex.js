// Test to see what's happening with the backslashes
const test1 = "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$";
console.log('test1:', test1);

const test2 = `Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$`;
console.log('test2:', test2);

// What we actually want:
const test3 = "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$";
console.log('test3:', test3);
