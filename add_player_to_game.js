import AWS from "aws-sdk";
import {IDENTIFIERS} from "./libs/identifiers";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
import handler from "./libs/handler-lib";

export const main = handler(async (event, context) => {

  const data = JSON.parse(event.body);
  // 'SET team[0] = list_append (team[0], :player), ' +
  //                       'words = list_append(words, :words)',
  const params = {
      TransactItems: [
            {
                Update: {
                    TableName: process.env.tableName,
                    Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`},
                    UpdateExpression: 'SET teams[0].members = list_append (teams[0].members, :player), ' +
                         'words = list_append(words, :words)',
                    ExpressionAttributeValues: {
                        ':player': [data.player],
                        ':words': data.words
                        },
                    ReturnValues:"UPDATED_NEW"
                }
            }
            // {
            //     Put: {
            //         TableName: process.env.tableName,
            //         Key: { id: { S: playerId } },
            //         ConditionExpression: 'coins >= :price',
            //         UpdateExpression: 'set coins = coins - :price, ' +
            //             'inventory = list_append(inventory, :items)',
            //         ExpressionAttributeValues: {
            //             ':items': { L: [{ S: itemId }] },
            //             ':price': { N: itemPrice.toString() }
            //         }
            //     }
            // },
            // {
            //     Put: {
            //         TableName: process.env.tableName,
            //         Key: { id: { S: playerId } },
            //         ConditionExpression: 'coins >= :price',
            //         UpdateExpression: 'set coins = coins - :price, ' +
            //             'inventory = list_append(inventory, :items)',
            //         ExpressionAttributeValues: {
            //             ':items': { L: [{ S: itemId }] },
            //             ':price': { N: itemPrice.toString() }
            //         }
            //     }
            // }
        ]
  };
  const result = await dynamoDb.transactWrite(params, function(err, data) {
  if (err) console.log(err);
  else console.log(data);
});
  console.log("result");
  console.log(result);
}
);