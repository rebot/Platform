import os
import re
import time
import json 
import time
import redis

from io import BytesIO
from base64 import b64decode

UUID = re.compile(r'(?<=queue-).*')

if __name__ == '__main__':
    
    url = os.environ.get('REDIS_URL', 'redis://localhost:6379')

    if not os.path.exists('worker/temp/'):
        os.mkdir('worker/temp/')

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
                data_object = json.loads(message['data'])
                header, encoded = data_object['content'].split(',', 1)
                data = b64decode(encoded)
                # Safe the data to a file
                filename = uuid.group(0) + os.path.splitext(data_object['name'])[1]
                with open(f'worker/temp/{filename}', 'wb') as f:
                    f.write(data)
                # Return some stats
                broadcast = f'broadcast-{uuid.group(0)}'
                print(f'WORKER - New job - ID {uuid.group(0)} - File: {data_object["name"]}', flush=True)

                # Give back the answer
                r.publish(broadcast, json.dumps({
                    'name': data_object['name'],
                    'uri': f'http://localhost:5000/download/{filename}'
                }))
        
        # Cleanup old files
        for root, dirs, files in os.walk('worker/temp'):
            for file in files:
                path = os.path.join(root,file)
                if time.time() - os.path.getmtime(path) > 600:
                    os.remove(path)

        # Sleep untill next cycle
        time.sleep(0.2)




