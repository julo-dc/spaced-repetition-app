from typing import List, Dict, Any
from supabase import create_client, Client
import os
from dotenv import load_dotenv


class SupabaseUploader:
    """
    Handles uploading verified questions to the Supabase database.
    Uses the service role key for admin-level access.
    """
    
    def __init__(self):
        load_dotenv()
        
        self.url = os.getenv('SUPABASE_URL')
        self.service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.url or not self.service_key:
            raise ValueError(
                "Missing Supabase credentials. Please set SUPABASE_URL and "
                "SUPABASE_SERVICE_ROLE_KEY in your .env file."
            )
        
        self.client: Client = create_client(self.url, self.service_key)
    
    def get_or_create_topic(self, topic_name: str) -> str:
        """
        Get existing topic by name or create a new one.
        Returns the topic UUID.
        """
        response = self.client.table('topics').select('id').eq('slug', self._slugify(topic_name)).execute()
        
        if response.data:
            return response.data[0]['id']
        
        slug = self._slugify(topic_name)
        new_topic = {
            'name': topic_name,
            'slug': slug,
            'parent_id': None
        }
        
        response = self.client.table('topics').insert(new_topic).execute()
        
        if response.data:
            print(f"Created new topic: {topic_name} (id: {response.data[0]['id']})")
            return response.data[0]['id']
        else:
            raise Exception(f"Failed to create topic: {topic_name}")
    
    def _slugify(self, text: str) -> str:
        """Convert topic name to URL-friendly slug."""
        return text.lower().replace(' ', '-').replace('_', '-')
    
    def upload_questions(self, topic_name: str, questions: List[Dict[str, Any]], difficulty_level: int = 1) -> int:
        """
        Upload a batch of questions to the database.
        Returns the number of successfully uploaded questions.
        """
        topic_id = self.get_or_create_topic(topic_name)
        
        uploaded_count = 0
        
        for question_content in questions:
            try:
                question_data = {
                    'topic_id': topic_id,
                    'content': question_content,
                    'hints': None,
                    'full_solution': {
                        'steps': question_content.get('solution_steps', [])
                    },
                    'difficulty_level': difficulty_level,
                    'times_shown': 0,
                    'times_correct': 0
                }
                
                response = self.client.table('questions').insert(question_data).execute()
                
                if response.data:
                    uploaded_count += 1
                    print(f"✓ Uploaded question {uploaded_count}")
                else:
                    print(f"✗ Failed to upload question")
            
            except Exception as e:
                print(f"✗ Error uploading question: {e}")
        
        return uploaded_count
    
    def get_topic_question_count(self, topic_name: str) -> int:
        """Get the number of questions for a specific topic."""
        try:
            topic_id = self.get_or_create_topic(topic_name)
            response = self.client.table('questions').select('id', count='exact').eq('topic_id', topic_id).execute()
            return response.count if hasattr(response, 'count') else len(response.data)
        except Exception as e:
            print(f"Error getting question count: {e}")
            return 0
