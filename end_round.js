import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {ROUND_STATUSES} from "./utils/statuses";
export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const endRound = data.wordsLeft && data.wordsLeft.length === 0;
    const endRoundAttributeValue = endRound ? {}: {};
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: `SET rounds[:roundNo - 1].roundStatus = :endRoundStatus REMOVE rounds[:roundNo - 1].wordsLeft`,
            ExpressionAttributeValues: {
                ':wordsLeft': data.wordsLeft,
                ':roundNo': data.roundNo,
                ':roundStatus': ROUND_STATUSES.ACTIVE,
                ':increment' : 1,
                ':zero': 0,
                ':endRoundStatus': ROUND_STATUSES.ENDED
            },
            ConditionExpression: `rounds[:roundNo - 1].roundNo = :roundNo AND rounds[:roundNo - 1].roundStatus = :roundStatus AND size(rounds[:roundNo - 1].wordsLeft) = :zero`,
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