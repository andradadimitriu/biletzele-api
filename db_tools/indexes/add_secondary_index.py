import boto3

dynamodb = boto3.client('dynamodb')

try:
    dynamodb.update_table(
        TableName='biletzele',
        AttributeDefinitions=[
            {
                "AttributeName": "status",
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
                            "AttributeName": "status",
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
