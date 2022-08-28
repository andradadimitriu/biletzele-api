import { IDENTIFIERS } from "../libs/identifiers";
import dynamoDb from "../libs/dynamodb-lib";
import handler from "../libs/handler-lib";
import { GAME_STATUS } from "../utils/statuses";
import { gameBroadcast } from "./connection";
import { MESSAGE_TYPE } from "../utils/messageTypes";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body).data;
    const params = {
        TableName: process.env.tableName,
        Key: {
            PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`,
            SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`
        },
        UpdateExpression:
            "SET teams.#teamName.members.#playerId = :player, " +
            "players.ids = list_append(players.ids, :playerIdList), " +
            "players.playerNames = list_append(players.playerNames, :playerNameList), " +
            "words = list_append(words, :words)",
        ExpressionAttributeNames: {
            "#teamName": data.teamName,
            "#playerId": data.player.playerId,
        },
        ExpressionAttributeValues: {
            ":player": data.player,
            ":playerId": data.player.playerId, //TODO see if you actually need two vars for two dif types(list & str)
            ":playerName": data.player.playerName,
            ":playerIdList": [data.player.playerId],
            ":playerNameList": [data.player.playerName],
            ":gameStatus": GAME_STATUS.PENDING,
            ":words": data.words,
        },
        ConditionExpression:
            "gameStatus =:gameStatus AND not (contains(players.ids, :playerId) OR contains(players.playerNames, :playerName))",
        ReturnValues: "ALL_NEW",
    };
    const dynamoDbCall = async () => await dynamoDb.update(params);
    return await gameBroadcast(
        event,
        data.gameId,
        dynamoDbCall,
        MESSAGE_TYPE.NEW_PLAYER,
        true,
        true
    );
});