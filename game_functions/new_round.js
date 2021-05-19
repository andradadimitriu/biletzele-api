import {IDENTIFIERS} from "../libs/identifiers";
import dynamoDb from "../libs/dynamodb-lib";
import handler from "../libs/handler-lib";
import {GAME_STATUS} from "../utils/statuses";
import {MESSAGE_TYPE} from "../utils/messageTypes";
import {gameBroadcast} from "./connection";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body).data;
    console.log(`roundNo: ${data.roundNo}`);

    //TODO throw error if roundNo <1?
    const params = {
        TableName: process.env.tableName,
        Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`},
        UpdateExpression: `SET rounds[${data.roundNo - 1}].roundStatus = :newRoundStatus, rounds[${data.roundNo - 1}].wordsLeft = words`,
        ExpressionAttributeValues: {
            ':roundNo': data.roundNo,
            ':prevRoundStatus': GAME_STATUS.ENDED,
            ':newRoundStatus': GAME_STATUS.ACTIVE
        },
        ConditionExpression: `noRounds >= :roundNo AND rounds[${data.roundNo - 2}].roundStatus = :prevRoundStatus`,
        ReturnValues:"ALL_NEW"
    };

    const dynamoDbCall = async () => await dynamoDb.update(params);
    await gameBroadcast(event, data.gameId, dynamoDbCall, MESSAGE_TYPE.NEW_ROUND);
});