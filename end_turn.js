import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {MESSAGE_TYPE} from "./utils/messageTypes";
import {broadcast} from "./connection";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body).data;
    console.log(`turnNo: ${data.turnNo}`);
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`},
            UpdateExpression: 'SET turnNumber = turnNumber + :increment REMOVE turn',
            ExpressionAttributeValues: {
                ':turnNo': data.turnNo,
                ':increment': 1
            },
            ConditionExpression: 'turnNumber = :turnNo',
        ReturnValues:"ALL_NEW"
        };
    const result = await dynamoDb.update(params);
    if(result && result.Attributes) {
        const dataToSend = {type: MESSAGE_TYPE.END_OF_TURN, game: result.Attributes};
        console.log("Broadcast change to users");
        await broadcast(event, data.gameId, result.Attributes.connectionIds, dataToSend);
    }
    return result;
    }
);