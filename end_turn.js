import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body);

    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: 'SET turnNumber = turnNumber + :increment REMOVE turn',
            ExpressionAttributeValues: {
                ':turnNo': data.turnNo,
                ':increment': 1
            },
            ConditionExpression: 'turnNumber = :turnNo',
        ReturnValues:"UPDATED_NEW"
        };
        const result = await dynamoDb.update(params);
        console.log(`result: ${JSON.stringify(result)}`);
        return result;
    }
);