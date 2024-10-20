import json
import boto3
from auth import hash_password, verify_and_get_user
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('rbac-users')


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)
    

def check_permissions(event, required_permission):
    user, error = verify_and_get_user(event)
    if error:
        return None, {'statusCode': 401, 'body': json.dumps({'error': error})}
    
    if required_permission not in user['permissions']:
        return None, {'statusCode': 403, 'body': json.dumps({'error': 'Insufficient permissions'})}
    
    return user, None

def create_user(event, context):
    _, error_response = check_permissions(event, 'CanCreateUser')
    if error_response:
        return error_response

    try:
        body = json.loads(event['body'])
        
        # Check if username already exists
        username = body.get('username')
        if not username:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Username is required'})
            }
        
        # Query the table to check if the username already exists
        response = table.query(
            IndexName='username-index',  # You'll need to create this global secondary index
            KeyConditionExpression=boto3.dynamodb.conditions.Key('username').eq(username),
            ProjectionExpression='id'
        )
        
        if response['Items']:
            return {
                'statusCode': 409,
                'body': json.dumps({'error': 'Username already exists'})
            }
        
        # Scan the whole table to get all IDs. fix in the future
        response = table.scan(
            ProjectionExpression='id'
        )
        
        # Find the maximum ID
        max_id = 0
        for item in response['Items']:
            max_id = max(max_id, int(item['id']))
        
        new_user_id = max_id + 1
        
        # Hash the password
        hashed_password = hash_password(body['password'])
        
        # Create the item with all the fields we expect
        item = {
            'id': new_user_id,
            'name': body.get('name', ''),
            'username': username,
            'email': body.get('email', ''),
            'phone': body.get('phone', ''),
            'website': body.get('website', ''),
            'role': body.get('role', 'Staff'),
            'password_hash': hashed_password,
            'permissions': body.get('permissions', ['CanReadUser']),  # array of strings
        }
        
        # Remove any attributes with empty values
        item = {k: v for k, v in item.items() if v}
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'body': json.dumps({'message': 'User created successfully', 'userId': new_user_id})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def read_user(event, context):
    _, error_response = check_permissions(event, 'CanReadUser')
    if error_response:
        return error_response

    try:
        if 'queryStringParameters' in event and event['queryStringParameters'] and 'id' in event['queryStringParameters']:
            # Read a single user
            user_id = int(event['queryStringParameters']['id'])
            response = table.get_item(Key={'id': user_id})
            
            if 'Item' in response:
                user = response['Item']
                # Remove the password_hash key
                user.pop('password_hash', None)
                return {
                    'statusCode': 200,
                    'body': json.dumps(user, cls=DecimalEncoder)
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'message': 'User not found'})
                }
        else:
            # Read all users
            response = table.scan()
            users = response['Items']
            # Remove password_hash from all users
            for user in users:
                user.pop('password_hash', None)
            
            return {
                'statusCode': 200,
                'body': json.dumps(users, cls=DecimalEncoder)
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def update_user(event, context):
    _, error_response = check_permissions(event, 'CanUpdateUser')
    if error_response:
        return error_response

    try:
        user_id = int(event['queryStringParameters']['id'])
        body = json.loads(event['body'])
        
        update_expression = "set "
        expression_attribute_values = {}
        expression_attribute_names = {}
        
        for key, value in body.items():
            if key == 'id':
                continue
            update_expression += f"#{key} = :{key}, "
            expression_attribute_values[f":{key}"] = value
            expression_attribute_names[f"#{key}"] = key
        
        update_expression = update_expression.rstrip(", ")
        
        response = table.update_item(
            Key={'id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
            ReturnValues="UPDATED_NEW"
        )
        
        updated_user = response['Attributes']
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User updated successfully', 'updatedAttributes': updated_user}, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def delete_user(event, context):
    _, error_response = check_permissions(event, 'CanDeleteUser')
    if error_response:
        return error_response

    try:
        user_id = int(event['queryStringParameters']['id'])
        
        table.delete_item(Key={'id': user_id})
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User deleted successfully'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    
