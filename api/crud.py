import json
import boto3
from auth import hash_password, verify_and_get_user
from passlib.hash import pbkdf2_sha256

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('rbac-users')

def check_permissions(event, required_role='Admin'):
    user, error = verify_and_get_user(event)
    if error:
        return None, {'statusCode': 401, 'body': json.dumps({'error': error})}
    
    if user['role'] != required_role:
        return None, {'statusCode': 403, 'body': json.dumps({'error': 'Insufficient permissions'})}
    
    return user, None

def create_user(event, context):
    user, error_response = check_permissions(event)
    if error_response:
        return error_response

    try:
        body = json.loads(event['body'])
        
        # Atomically increment and get the next user ID
        response = table.update_item(
            Key={'id': 'USER_COUNTER'},
            UpdateExpression='SET current_count = if_not_exists(current_count, :start) + :inc',
            ExpressionAttributeValues={
                ':inc': 1,
                ':start': 0,
            },
            ReturnValues='UPDATED_NEW'
        )
        
        user_id = response['Attributes']['current_count']
        # Hash the password
        hashed_password = hash_password(body['password'])
        
        # Create the item with all the fields we expect
        item = {
            'id': int(user_id),
            'name': body.get('name', ''),
            'username': body.get('username', ''),
            'email': body.get('email', ''),
            'address': body.get('address', ''),
            'phone': body.get('phone', ''),
            'website': body.get('website', ''),
            'company': body.get('company', ''),
            'password_hash': hashed_password,
            'role': body.get('role', 'Staff'),
        }
        
        # Remove any attributes with empty values
        item = {k: v for k, v in item.items() if v}
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'body': json.dumps({'message': 'User created successfully', 'userId': user_id})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def read_user(event, context):
    user, error_response = check_permissions(event, required_role='Staff')
    if error_response:
        return error_response

    try:
        user_id = event['pathParameters']['id']
        
        response = table.get_item(Key={'id': user_id})
        
        if 'Item' in response:
            user = response['Item']
            return {
                'statusCode': 200,
                'body': json.dumps(user)
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'User not found'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def update_user(event, context):
    user, error_response = check_permissions(event)
    if error_response:
        return error_response

    try:
        user_id = event['pathParameters']['id']
        body = json.loads(event['body'])
        
        update_expression = "set "
        expression_attribute_values = {}
        
        for key, value in body.items():
            update_expression += f"#{key} = :{key}, "
            expression_attribute_values[f":{key}"] = value
        
        update_expression = update_expression.rstrip(", ")
        
        response = table.update_item(
            Key={'id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames={f"#{k}": k for k in body.keys()},
            ReturnValues="UPDATED_NEW"
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User updated successfully', 'updatedAttributes': response['Attributes']})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def delete_user(event, context):
    user, error_response = check_permissions(event)
    if error_response:
        return error_response

    try:
        user_id = event['pathParameters']['id']
        
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
