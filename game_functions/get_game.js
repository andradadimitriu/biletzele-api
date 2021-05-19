import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import {IDENTIFIERS} from "../libs/identifiers";

export const main = handler(async (event) => {
  const params = {
      TableName: process.env.tableName,
      Key: {
          PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`,
          SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`
      }
  };

  const result = await dynamoDb.get(params);
  if ( ! result.Item) {
        return {gameNotFound: true};
  }
  return result.Item;
}
);