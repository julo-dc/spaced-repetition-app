#!/usr/bin/env python3
"""
Content Engine - Generate and upload verified math questions to Supabase.

Usage:
    python main.py --topic "Chain Rule" --count 5
    python main.py --topic "Product Rule" --count 10 --difficulty 2
"""

import argparse
import os
from dotenv import load_dotenv
from generator import MathGenerator
from uploader import SupabaseUploader


def main():
    load_dotenv()
    
    parser = argparse.ArgumentParser(
        description='Generate and upload verified math questions to Supabase'
    )
    
    parser.add_argument(
        '--topic',
        type=str,
        required=True,
        help='Math topic (e.g., "Chain Rule", "Product Rule", "Quotient Rule")'
    )
    
    parser.add_argument(
        '--count',
        type=int,
        required=True,
        help='Number of questions to generate (Note: Mistral free tier has 1 req/sec limit)'
    )
    
    parser.add_argument(
        '--difficulty',
        type=int,
        default=1,
        choices=[1, 2, 3, 4, 5],
        help='Difficulty level (1-5, default: 1)'
    )
    
    parser.add_argument(
        '--skip-upload',
        action='store_true',
        help='Generate questions but skip uploading to Supabase'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("SPACED REPETITION - CONTENT ENGINE (Mistral Free Tier)")
    print("=" * 60)
    print(f"Topic: {args.topic}")
    print(f"Count: {args.count}")
    print(f"Difficulty: {args.difficulty}")
    if os.getenv('MISTRAL_API_KEY'):
        print(f"Note: Will respect 1 req/sec rate limit (≈{args.count * 1.1:.1f}s total)")
    else:
        print("Note: Using template solution steps (no API key)")
    print("=" * 60)
    print()
    
    print("Step 1: Generating questions with SymPy verification...")
    print("-" * 60)
    
    generator = MathGenerator()
    questions = generator.generate_batch(args.topic, args.count)
    
    print()
    print(f"✓ Successfully generated {len(questions)}/{args.count} questions")
    print()
    
    if args.skip_upload:
        print("Skipping upload (--skip-upload flag set)")
        print("\nSample question:")
        if questions:
            import json
            print(json.dumps(questions[0], indent=2))
        return
    
    print("Step 2: Uploading to Supabase...")
    print("-" * 60)
    
    try:
        uploader = SupabaseUploader()
        
        before_count = uploader.get_topic_question_count(args.topic)
        print(f"Questions in database before upload: {before_count}")
        print()
        
        uploaded = uploader.upload_questions(args.topic, questions, args.difficulty)
        
        after_count = uploader.get_topic_question_count(args.topic)
        
        print()
        print("=" * 60)
        print(f"✓ Upload complete!")
        print(f"  - Uploaded: {uploaded}/{len(questions)} questions")
        print(f"  - Total in database: {after_count} questions for '{args.topic}'")
        print("=" * 60)
    
    except Exception as e:
        print()
        print("=" * 60)
        print(f"✗ Upload failed: {e}")
        print("=" * 60)
        print("\nMake sure you have:")
        print("1. Created a .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("2. Run the database migration in Supabase")
        print("3. Have network connectivity to Supabase")


if __name__ == '__main__':
    main()
