import json
from crud import create_user, read_user, update_user, delete_user
from auth import login, check_auth, logout


def lambda_handler(event, context):
    try:
        http_method = event["httpMethod"]
        path = event["path"]
        print(event)
        api_index = path.find("/api")
        if api_index != -1:
            path = path[api_index:]

        # Auth endpoint
        if path == "/api/v1/auth/login" and http_method == "POST":
            return login(event, context)
        elif path == "/api/v1/auth/check" and http_method == "GET":
            return check_auth(event, context)
        elif path == "/api/v1/auth/logout" and http_method == "POST":
            return logout(event, context)

        # CRUD endpoints
        if path.startswith("/api/v1/users"):
            user_id = event["queryStringParameters"].get("id") \
                if event.get("queryStringParameters") else None

            if http_method == "POST" and not user_id:
                return create_user(event, context)
            elif http_method == "GET" and user_id:
                return read_user(event, context)
            elif http_method == "PUT" and user_id:
                return update_user(event, context)
            elif http_method == "DELETE" and user_id:
                return delete_user(event, context)

        # If no matching route is found
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Not Found'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
