import AWS from "aws-sdk";
import {IDENTIFIERS} from "./libs/identifiers";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
import handler from "./libs/handler-lib";

export const main = handler(async (event, context) => {

  const data = JSON.parse(event.body);
  const params = {
        TableName: process.env.tableName,
        Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`},
        UpdateExpression: 'SET teams[0].members = list_append (teams[0].members, :player), ' +
            'players.ids = list_append(players.ids, :playerIdList), ' +
            'players.playerNames = list_append(players.playerNames, :playerNameList), ' +
            'words = list_append(words, :words)',
        ExpressionAttributeValues: {
            ':player': [data.player],
            ':playerId': data.player.playerId, //TODO see if you actually need two vars for two dif types(list & str)
            ':playerName': data.player.playerName,
            ':playerIdList': [data.player.playerId],
            ':playerNameList': [data.player.playerName],
            ':words': data.words
            },
        ConditionExpression: "not (contains(players.ids, :playerId) OR contains(player.playerNames, :playerName))",
        ReturnValues:"UPDATED_NEW"
  };
  const result = await dynamoDb.update(params, function(err, data) {
  if (err) console.log(err);
  else console.log(data);
});
  console.log("result");
  console.log(result);
}
);