import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: 'REMOVE rounds[:roundIndex].wordsLeft[turn.wordIndex] SET turn.wordIndex =:newWordIndex, turnNumber = turnNumber + 1, turn.turnNo = turn.turnNo + 1',
            ExpressionAttributeValues: {
                ':prevTurnNo': data.turnNo,
                ':newWordIndex': data.wordIndex,
                ':roundIndex': data.roundNo - 1
            },
            ConditionExpression: 'turnNumber = :prevTurnNo AND turnNumber = turn.turnNumber',
        ReturnValues:"UPDATED_NEW"
        };
        const result = await dynamoDb.update(params);
        console.log(`result: ${JSON.stringify(result)}`);
        return result;
    }
);