import {IDENTIFIERS} from "./libs/identifiers";
import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const params = {
        TableName: process.env.tableName,
        IndexName: IDENTIFIERS.ACTIVE_GAMES_INDEX,
        KeyConditionExpression: 'gameStatus = :status',
        ExpressionAttributeValues: {
            ':status': event.pathParameters.status
        },
        ScanIndexForward: false
  };
  const result = await dynamoDb.query(params, function(err, data) {
      if (err) console.log(err);
      else console.log(data);
  });
  console.log(`result ${result}`);
  if ( ! result.Items) {
        throw new Error("Something went wrong. No games found with the specified status.");
  }
  return result.Items;
}
);