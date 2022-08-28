import {IDENTIFIERS} from "../libs/identifiers";
import dynamoDb from "../libs/dynamodb-lib";
import handler from "../libs/handler-lib";
import {gameBroadcast} from "./connection";
import {MESSAGE_TYPE} from "../utils/messageTypes";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body).data;
    console.log("body");
    console.log(event.body);
    const params = {
        TableName: process.env.tableName,
    Key: {
            PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`,
            SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`
        },
        UpdateExpression: 'SET teams.#teamName.members.#playerId.ready = :ready',
        ExpressionAttributeNames: {"#teamName": data.teamName, "#playerId": data.playerId },
        ExpressionAttributeValues: {
            ':ready': data.ready,
        },
        ReturnValues: "ALL_NEW"
    };
    const dynamoDbCall = async () => await dynamoDb.update(params);
    return await gameBroadcast(event, data.gameId, dynamoDbCall, MESSAGE_TYPE.PLAYER_READY, true,  true);

});