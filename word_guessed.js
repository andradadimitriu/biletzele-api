import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {ROUND_STATUSES} from "./utils/statuses";
export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: 'SET turn.word =:word REMOVE rounds[:roundIndex].wordsLeft[:wordIndex]',
            ExpressionAttributeValues: {
                ':turnNo': data.turnNo,
                ':wordIndex': data.wordIndex,
                ':roundIndex': data.roundNo - 1
            },
            ConditionExpression: 'turnNumber = :turnNo',
        ReturnValues:"UPDATED_NEW"
        };
        const result = await dynamoDb.update(params);
        console.log(`result: ${JSON.stringify(result)}`);
        return result;
    }
);