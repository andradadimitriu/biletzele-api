import {IDENTIFIERS} from "../libs/identifiers";
import dynamoDb from "../libs/dynamodb-lib";
import handler from "../libs/handler-lib";
import {GAME_STATUS} from "../utils/statuses";
import {MESSAGE_TYPE} from "../utils/messageTypes";
import {gameBroadcast} from "./connection";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body).data;
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`},
            UpdateExpression: `SET rounds[${data.roundNo - 1}].roundStatus = :endRoundStatus, turnNumber = turnNumber + :increment REMOVE rounds[${data.roundNo - 1}].wordsLeft, turn`,
            ExpressionAttributeValues: {
                ':turnNo': data.turnNo,
                ':roundNo': data.roundNo,
                ':roundStatus': GAME_STATUS.ACTIVE,
                ':increment' : 1,
                ':zero': 0,
                ':endRoundStatus': GAME_STATUS.ENDED
            },
            ConditionExpression: `rounds[${data.roundNo - 1}].roundNo = :roundNo AND rounds[${data.roundNo - 1}].roundStatus = :roundStatus AND size(rounds[${data.roundNo - 1}].wordsLeft) = :zero AND turnNumber = :turnNo`,
            ReturnValues:"ALL_NEW"
        };
    const dinamoDbCall = async() => await dynamoDb.update(params);
    await gameBroadcast(event, data.gameId, dinamoDbCall, MESSAGE_TYPE.END_OF_ROUND);
    }
);