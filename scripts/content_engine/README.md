# Content Engine - Math Question Generator

A Python-based content generation system that creates **verified** math questions using SymPy as the source of truth, preventing LLM hallucinations.

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  Generator  │──────▶│   Verifier   │──────▶│  Uploader   │
│  (SymPy)    │       │   (SymPy)    │       │ (Supabase)  │
└─────────────┘       └──────────────┘       └─────────────┘
     Creates              Validates             Stores
   random math            answers are           verified
   problems              correct                questions
```

### Key Principles

1. **SymPy is the source of truth** - All calculations are done programmatically
2. **LLM is optional** - Only used for generating solution explanations
3. **No hallucinations** - Wrong answers are discarded before upload

## Setup

### 1. Install Dependencies

```bash
cd scripts/content_engine
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
OPENAI_API_KEY=your_openai_key_here  # Optional, for solution steps
```

**Where to find these:**
- **SUPABASE_URL**: Supabase Dashboard → Settings → API
- **SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API → service_role (secret)
- **OPENAI_API_KEY**: platform.openai.com (optional, fallback to templates)

### 3. Run Database Migration

Make sure you've run the migration in `supabase/migrations/20260107_initial_schema.sql` in your Supabase SQL Editor.

## Usage

### Generate and Upload Questions

```bash
# Generate 5 Chain Rule questions
python main.py --topic "Chain Rule" --count 5

# Generate 10 Product Rule questions with difficulty 2
python main.py --topic "Product Rule" --count 10 --difficulty 2

# Generate without uploading (for testing)
python main.py --topic "Quotient Rule" --count 3 --skip-upload
```

### Supported Topics

- **Chain Rule** - Derivatives of composite functions
- **Product Rule** - Derivatives of products
- **Quotient Rule** - Derivatives of quotients
- **Basic Derivatives** - Simple polynomial and trig functions

## Output Format

Each question is stored as JSONB in the `questions.content` column:

```json
{
  "statement": "Find the derivative of $$f(x) = \\sin(x^2)$$",
  "options": [
    {"id": "a", "latex": "2x\\cos(x^2)", "is_correct": true},
    {"id": "b", "latex": "\\cos(x^2)", "is_correct": false},
    {"id": "c", "latex": "2x\\sin(x^2)", "is_correct": false},
    {"id": "d", "latex": "-2x\\cos(x^2)", "is_correct": false}
  ],
  "solution_steps": [
    "Identify the outer function and inner function",
    "Apply the Chain Rule: (f ∘ g)'(x) = f'(g(x)) · g'(x)",
    "Compute the derivative: 2x\\cos(x^2)"
  ]
}
```

## How It Works

### 1. Generator (`generator.py`)

- Uses **SymPy** to create random functions based on the topic
- Example: For "Chain Rule", generates `sin(x^2)`, `cos(3x)`, etc.

### 2. Verifier (Built-in)

- Computes the correct answer using `sympy.diff()`
- Generates 3 distractor answers by modifying the result
- **Guarantees** mathematical correctness

### 3. Uploader (`uploader.py`)

- Connects to Supabase using the service role key
- Creates topics if they don't exist
- Inserts questions into the `questions` table

## Extending the Engine

### Add New Topics

Edit `generator.py` and add a new case in `_generate_random_function()`:

```python
elif topic.lower() in ["integration", "integrals"]:
    # Define integration problems
    return self.x**2 + 3*self.x
```

### Customize Distractors

Modify `_generate_distractors()` to create more sophisticated wrong answers.

## Troubleshooting

**"Missing Supabase credentials"**
- Make sure `.env` exists and has valid keys

**"Failed to create topic"**
- Check that the database migration has been run
- Verify your SERVICE_ROLE_KEY has write permissions

**"Question generation failed"**
- Check console logs for SymPy errors
- Some function combinations may not simplify well

## Next Steps

- Add support for integration problems
- Implement difficulty scaling
- Add hints generation
- Support for multi-step problems
