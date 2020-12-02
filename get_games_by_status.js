import AWS from "aws-sdk";
import {IDENTIFIERS} from "./libs/identifiers";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
import handler from "./libs/handler-lib";

export const main = handler(async (event, context) => {

  const data = JSON.parse(event.body);
  const params = {
        TableName: process.env.tableName,
        IndexName: IDENTIFIERS.ACTIVE_GAMES_INDEX,
        KeyConditionExpression: 'game_status = :status',
        ExpressionAttributeValues: {
            ':status': data.status
            //TODO event.pathParameters.status
        }
  };
  const result = await dynamoDb.query(params, function(err, data) {
      if (err) console.log(err);
      else console.log(data);
  });
  console.log(`result ${result}`);
  if ( ! result.Items) {
        throw new Error("Item not found.");
  }
  return result.Items;
}
);