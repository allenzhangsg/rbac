import json

def lambda_handler(event: dict, context: dict) -> dict:
    # Parse the incoming event data
    name = event.get('name', 'World')
    
    # Create a response
    response = {
        'statusCode': 200,
        'body': json.dumps(f'Hello, {name}!')
    }
    
    return response

