import os
import re
import json 
import time
import redis

UUID = re.compile(r'(?<=queue-).*')

if __name__ == '__main__':
    
    url = os.environ.get('REDIS_URL', 'redis://localhost:6379')

    r = redis.from_url(url)
    p = r.pubsub()
    p.psubscribe('queue-*')

    while True:
        # Retrieve the message
        message = p.get_message()
        # Process if message is received on a pattern subsr.
        if message and message['type'] == 'pmessage':
            # Retrieve the channel
            uuid = UUID.search(message['channel'].decode())
            # If uuid has been found
            if uuid:
                # Define the broadcast channel
                broadcast = f'broadcast-{uuid.group(0)}'
                print(f'WORKER - New job - ID {uuid.group(0)} - Message: {message["data"]}')
                # Load the data

                # Do something with the data
                time.sleep(5)

                # Give back the answer
                r.publish(broadcast, 'WORKER - Job done!')
        
        # Sleep 10 seconds
        time.sleep(2)




