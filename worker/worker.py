import os
import json 
import time
import redis

if __name__ == '__main__':
    
    url = os.environ.get('REDIS_URL', 'redis://localhost:6379')

    r = redis.from_url(url)
    p = r.pubsub()
    p.subscribe('sweco')

    while True:
        # Retrieve the message
        message = p.get_message()

        if message and message['type'] == 'message':
            body = json.loads(message['data'])
        
        # Sleep 10 seconds
        time.sleep(2)




