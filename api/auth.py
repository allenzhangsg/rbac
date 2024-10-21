import json
import boto3
from boto3.dynamodb.conditions import Key
from passlib.hash import pbkdf2_sha256
from jose import jwt, JWTError
import os
from datetime import datetime, timedelta, timezone

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('rbac-users')

# set JWT_SECRET_KEY in the lambda environment variables
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pbkdf2_sha256.verify(plain_password, hashed_password)

def hash_password(password):
    return pbkdf2_sha256.hash(password)

def get_user(username: str):
    response = table.query(
        IndexName='username-index',  # second level index on username
        KeyConditionExpression=Key('username').eq(username)
    )
    items = response.get('Items', [])
    return items[0] if items else None

def verify_and_get_user(event):
    try:
        # Extract token from Cookie
        cookie_header = event.get('headers', {}).get('Cookie', '')
        token = next((cookie.split('=')[1] for cookie in cookie_header.split('; ') if cookie.startswith('access_token=')), None)

        if not token:
            return None, "No token provided"

        # Verify the token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None, "Invalid token"

        # Extract username and role from the payload
        username: str = payload.get('username')
        role: str = payload.get('role')

        if not username or not role:
            return None, "Token payload is missing required fields"

        # Fetch user data from the database
        user = get_user(username)
        if not user:
            return None, "User not found"

        # Return user data including permissions from the database
        return {
            "username": username,
            "role": role,
            "permissions": user.get('permissions', [])
        }, None

    except Exception as e:
        return None, str(e)

def login(event, context):
    try:
        body = json.loads(event['body'])
        username = body['username']
        plain_password = body['password']

        user = get_user(username)
        if not user:
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Invalid username or password'})
            }

        if not verify_password(plain_password, user['password_hash']):
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Invalid username or password'})
            }

        access_token = create_access_token(
            data={
                "sub": str(user["id"]),
                "username": user["username"],
                "role": user["role"]
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'access_token': access_token, 'token_type': 'bearer'}),
            'headers': {
                'Set-Cookie': f'access_token={access_token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age={ACCESS_TOKEN_EXPIRE_MINUTES * 60}'
            }
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def check_auth(event, context):
    user, error = verify_and_get_user(event)
    if error:
        return {
            'statusCode': 401,
            'body': json.dumps({'error': error})
        }
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'username': user['username'],
            'role': user['role'],
            'permissions': user['permissions']
        })
    }

def logout(event, context):
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Logged out successfully'}),
        'headers': {
            'Set-Cookie': 'access_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0'
        }
    }
