import {IDENTIFIERS} from "../libs/identifiers";
import dynamoDb from "../libs/dynamodb-lib";
import handler from "../libs/handler-lib";
import {GAME_STATUS} from "../utils/statuses";
import {gameBroadcast} from "./connection";
import {MESSAGE_TYPE} from "../utils/messageTypes";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body).data;
    console.log("data");
    console.log(data);
    const params = {
        TableName: process.env.tableName,
        Key: {
            PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`,
            SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`
        },
        UpdateExpression:
            "SET teams.#newTeamName.members.#playerId = teams.#oldTeamName.members.#playerId  " +
            "REMOVE teams.#oldTeamName.members.#playerId",
        ExpressionAttributeNames: {
            "#newTeamName": data.newTeamName,
            "#oldTeamName": data.oldTeamName,
            "#playerId": data.playerId,
        },
        ExpressionAttributeValues: {
            ":playerId": data.playerId,
            ":gameStatus": GAME_STATUS.PENDING,
        },
        ConditionExpression:
            `gameStatus = :gameStatus AND contains(players.ids, :playerId)`,
        ReturnValues: "ALL_NEW",
    };
    console.log("before update");
    console.log(GAME_STATUS.PENDING);
    console.log(params);
    const dynamoDbCall = async () => await dynamoDb.update(params);
    console.log("after update");
    return await gameBroadcast(
        event,
        data.gameId,
        dynamoDbCall,
        MESSAGE_TYPE.PLAYER_SWITCHED_TEAM,
        true,
        true
    );
});