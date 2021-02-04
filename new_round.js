import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {GAME_STATUS} from "./utils/statuses";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    console.log(`roundNo: ${data.roundNo}`);

    //TODO throw error if roundNo <1
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: `SET rounds[${data.roundNo - 1}].roundStatus = :newRoundStatus, rounds[${data.roundNo - 1}].wordsLeft = words`,
            ExpressionAttributeValues: {
                ':roundNo': data.roundNo,
                ':prevRoundStatus': GAME_STATUS.ENDED,
                ':newRoundStatus': GAME_STATUS.ACTIVE
            },
            ConditionExpression: `noRounds >= :roundNo AND rounds[${data.roundNo - 2}].roundStatus = :prevRoundStatus`,
        ReturnValues:"UPDATED_NEW"
        };
        const result = await dynamoDb.update(params);
        console.log(`result: ${JSON.stringify(result)}`);
        return result;
    }
);