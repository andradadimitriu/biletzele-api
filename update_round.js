import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {GAME_STATUSES} from "./utils/statuses";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    const endRound = data.wordsLeft && data.wordsLeft.length === 0;
    const endRoundAttributeValue = endRound ? {':endRoundStatus': ROUND_STATUSES.ENDED}: {};
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: `SET turnNumber = turnNumber + :increment, rounds[:roundNo - 1].wordsLeft = :wordsLeft`+
                `${endRound ? ", rounds[:roundNo - 1].roundStatus = :endRoundStatus": ""}`,
            ExpressionAttributeValues: {
                ':wordsLeft': data.wordsLeft,
                ':roundNo': data.roundNo,
                ':roundStatus': GAME_STATUSES.ACTIVE,
                ':increment' : 1,
                ...endRoundAttributeValue
            },
            ConditionExpression: `rounds[:roundNo - 1].roundNo = :roundNo AND rounds[:roundNo - 1].roundStatus = :roundStatus`,
            ReturnValues:"UPDATED_NEW"
        };
    const result = await dynamoDb.update(params);
    if(endRound && result.Item.noRounds === data.roundNo){
        console.log("should end game");
    }
    console.log(`result: ${JSON.stringify(result)}`);
    return result;
    }
);