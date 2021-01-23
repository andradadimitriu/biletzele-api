import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {GAME_STATUSES} from "./utils/statuses";
export const main = handler(async (event) => {
    const params = {
        TableName: process.env.tableName,
        Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
        UpdateExpression: 'SET gameStatus = :newGameStatus, rounds[0].roundStatus = :newGameStatus, rounds[0].wordsLeft = words',
        ExpressionAttributeValues: {
            ':newGameStatus': GAME_STATUSES.ACTIVE,
            ':oldGameStatus': GAME_STATUSES.PENDING,
            ':zero': 0
        },
        ConditionExpression: `gameStatus = :oldGameStatus AND rounds[0].roundStatus = :oldGameStatus`,
        ReturnValues:"UPDATED_NEW"
  };
  const result = await dynamoDb.update(params);
  console.log(`result: ${JSON.stringify(result)}`);
  return result;
}
);