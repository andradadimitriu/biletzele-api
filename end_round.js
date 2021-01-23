import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {GAME_STATUSES} from "./utils/statuses";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: `SET rounds[:roundIndex].roundStatus = :endRoundStatus, turnNumber = turnNumber + :increment, REMOVE rounds[:roundIndex].wordsLeft, turn`,
            ExpressionAttributeValues: {
                ':turnNo': data.turnNo,
                ':roundNo': data.roundNo,
                ':roundIndex': data.roundNo - 1,
                ':roundStatus': GAME_STATUSES.ACTIVE,
                ':increment' : 1,
                ':zero': 0,
                ':endRoundStatus': GAME_STATUSES.ENDED
            },
            ConditionExpression: `rounds[:roundIndex].roundNo = :roundNo AND rounds[:roundIndex].roundStatus = :roundStatus AND size(rounds[roundIndex].wordsLeft) = :zero AND turnNumber = :turnNo`,
            ReturnValues:"UPDATED_NEW"
        };
    const result = await dynamoDb.update(params);
    if(result.Item.noRounds === data.roundNo){
        console.log("should end game");
    }
    console.log(`result: ${JSON.stringify(result)}`);
    return result;
    }
);