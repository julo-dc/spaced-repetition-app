#!/usr/bin/env python3
"""
Bulk Question Generator - Generate thousands of questions quickly.

Usage:
    python bulk_generate.py --topic "Chain Rule" --count 10000
    python bulk_generate.py --multiple --count-per-topic 5000
"""

import argparse
import time
from dotenv import load_dotenv
from template_fast_generator import TemplateFastGenerator
from uploader import SupabaseUploader


def generate_for_topic(topic: str, count: int, upload: bool = True):
    """Generate questions for a single topic"""
    print(f"\n{'='*60}")
    print(f"Generating {count} questions for: {topic}")
    print(f"{'='*60}\n")
    
    start_time = time.time()
    
    # Generate questions
    generator = TemplateFastGenerator()
    questions = generator.generate_batch(topic, count)
    
    generation_time = time.time() - start_time
    questions_per_sec = len(questions) / generation_time if generation_time > 0 else 0
    
    print(f"\n✓ Generated {len(questions)} questions in {generation_time:.2f}s")
    print(f"  Speed: {questions_per_sec:.1f} questions/second")
    
    if not upload:
        print("\nSkipping upload (--no-upload flag)")
        return len(questions)
    
    # Upload to database
    print(f"\nUploading to Supabase...")
    try:
        uploader = SupabaseUploader()
        
        before_count = uploader.get_topic_question_count(topic)
        uploaded = uploader.upload_questions(topic, questions, difficulty_level=1)
        after_count = uploader.get_topic_question_count(topic)
        
        upload_time = time.time() - start_time - generation_time
        
        print(f"\n✓ Upload complete!")
        print(f"  - Uploaded: {uploaded}/{len(questions)}")
        print(f"  - Previous count: {before_count}")
        print(f"  - New count: {after_count}")
        print(f"  - Upload time: {upload_time:.2f}s")
        
        return uploaded
        
    except Exception as e:
        print(f"\n✗ Upload failed: {e}")
        return 0


def main():
    load_dotenv()
    
    parser = argparse.ArgumentParser(
        description='Bulk generate math questions using template-based approach'
    )
    
    parser.add_argument(
        '--topic',
        type=str,
        help='Single topic to generate (e.g., "Chain Rule")'
    )
    
    parser.add_argument(
        '--count',
        type=int,
        default=1000,
        help='Number of questions to generate (default: 1000)'
    )
    
    parser.add_argument(
        '--multiple',
        action='store_true',
        help='Generate for all supported topics'
    )
    
    parser.add_argument(
        '--count-per-topic',
        type=int,
        default=5000,
        help='Questions per topic when using --multiple (default: 5000)'
    )
    
    parser.add_argument(
        '--no-upload',
        action='store_true',
        help='Generate only, skip uploading to database'
    )
    
    args = parser.parse_args()
    
    upload = not args.no_upload
    
    print("="*60)
    print("BULK QUESTION GENERATOR - Template-Based (No LLM)")
    print("="*60)
    print(f"Upload to DB: {upload}")
    print()
    
    total_start = time.time()
    total_generated = 0
    
    if args.multiple:
        # Generate for all topics
        topics = [
            "Chain Rule",
            "Product Rule", 
            "Quotient Rule",
            "Basic Derivatives"
        ]
        
        print(f"Generating {args.count_per_topic} questions for each of {len(topics)} topics")
        print(f"Total: {args.count_per_topic * len(topics)} questions\n")
        
        for topic in topics:
            count = generate_for_topic(topic, args.count_per_topic, upload)
            total_generated += count
    
    elif args.topic:
        # Generate for single topic
        total_generated = generate_for_topic(args.topic, args.count, upload)
    
    else:
        parser.error("Must specify either --topic or --multiple")
    
    total_time = time.time() - total_start
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total questions generated: {total_generated}")
    print(f"Total time: {total_time:.2f}s")
    print(f"Average speed: {total_generated/total_time:.1f} questions/second")
    print("="*60)


if __name__ == '__main__':
    main()
