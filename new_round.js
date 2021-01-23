import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {GAME_STATUSES} from "./utils/statuses";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    console.log(`roundNo: ${data.roundNo}`);

    //TODO throw error if roundNo <1
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: 'SET rounds[:roundIndex].roundStatus = :newRoundStatus, rounds[:roundIndex].wordsLeft = words',
            ExpressionAttributeValues: {
                ':roundNo': data.roundNo,
                ':roundIndex': data.roundNo - 1,
                ':prevRoundStatus': GAME_STATUSES.ENDED,
                ':newRoundStatus': GAME_STATUSES.ACTIVE,
                ':zero': 0
            },
            ConditionExpression: `noRounds >= :roundNo AND size(rounds[${data.roundNo - 2}].wordsLeft) = :zero AND rounds[${data.roundNo - 2}].roundStatus = :prevRoundStatus`,
        ReturnValues:"UPDATED_NEW"
        };
        const result = await dynamoDb.update(params);
        console.log(`result: ${JSON.stringify(result)}`);
        return result;
    }
);