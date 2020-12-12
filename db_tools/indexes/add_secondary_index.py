import boto3
import sys

dynamodb = boto3.client('dynamodb')

try:
    dynamodb.update_table(
        TableName='{env}{dash}biletzele'.format(env = sys.argv[0] if len(sys.argv) > 0 else "",
                                                dash = "-" if len(sys.argv) > 0 else "" ),
        AttributeDefinitions=[
            {
                "AttributeName": "gameStatus",
                "AttributeType": "S"
            },
            {
                "AttributeName": "PK",
                "AttributeType": "S"
            }
        ],
        GlobalSecondaryIndexUpdates=[
            {
                "Create": {
                    "IndexName": "ActiveGamesIndex",
                    "KeySchema": [
                        {
                            "AttributeName": "gameStatus",
                            "KeyType": "HASH"
                        },
                        {
                            "AttributeName": "PK",
                            "KeyType": "RANGE"
                        }
                    ],
                    "Projection": {
                        "ProjectionType": "ALL"
                    }
                }
            }
        ],
    )
    print("Table updated successfully.")
except Exception as e:
    print("Could not update table. Error:")
    print(e)
