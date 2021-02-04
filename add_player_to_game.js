import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {GAME_STATUS} from "./utils/statuses";

export const main = handler(async (event, context) => {

  const data = JSON.parse(event.body);
  const params = {
        TableName: process.env.tableName,
        Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`},
        UpdateExpression: 'SET teams.#teamName.members = list_append (teams.#teamName.members, :player), ' +
            'players.ids = list_append(players.ids, :playerIdList), ' +
            'players.playerNames = list_append(players.playerNames, :playerNameList), ' +
            'words = list_append(words, :words)',
        ExpressionAttributeNames:  {"#teamName": data.teamName},
        ExpressionAttributeValues: {
            ':player': [data.player],
            ':playerId': data.player.playerId, //TODO see if you actually need two vars for two dif types(list & str)
            ':playerName': data.player.playerName,
            ':playerIdList': [data.player.playerId],
            ':playerNameList': [data.player.playerName],
            ':gameStatus': GAME_STATUS.PENDING,
            ':words': data.words
            },
        ConditionExpression: "gameStatus =:gameStatus AND not (contains(players.ids, :playerId) OR contains(player.playerNames, :playerName))",
        ReturnValues:"UPDATED_NEW"
  };
  const result = await dynamoDb.update(params);
  console.log(`result: ${JSON.stringify(result)}`);
  return result;
}
);