import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {GAME_STATUS} from "./utils/statuses";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: `SET rounds[${data.roundNo - 1}].roundStatus = :endStatus, gameStatus = :endStatus REMOVE rounds[${data.roundNo - 1}].wordsLeft, turn`,
            ExpressionAttributeValues: {
                ':turnNo': data.turnNo,
                ':roundNo': data.roundNo,
                ':roundStatus': GAME_STATUS.ACTIVE,
                ':zero': 0,
                ':endStatus': GAME_STATUS.ENDED
            },
            ConditionExpression: `noRounds = :roundNo AND rounds[${data.roundNo - 1}].roundNo = :roundNo AND rounds[${data.roundNo - 1}].roundStatus = :roundStatus AND size(rounds[${data.roundNo - 1}].wordsLeft) = :zero AND turnNumber = :turnNo`,
            ReturnValues:"UPDATED_NEW"
        };
    const result = await dynamoDb.update(params);
    console.log(`result: ${JSON.stringify(result)}`);
    return result;
    }
);