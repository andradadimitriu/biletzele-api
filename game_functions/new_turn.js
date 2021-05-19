import {IDENTIFIERS} from "../libs/identifiers";
import dynamoDb from "../libs/dynamodb-lib";
import handler from "../libs/handler-lib";
export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    const turn = {
        turnNo: data.turnNo,
        startTime: data.startTime,
        wordIndex: data.wordIndex
    };
    console.log(`turn: ${turn}`);
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: 'SET turn =:turn',
            ExpressionAttributeValues: {
                ':turn': turn,
                ':turnNo': data.turnNo
            },
            ConditionExpression: "turnNumber = :turnNo",
        ReturnValues:"UPDATED_NEW"
        };
        const result = await dynamoDb.update(params);
        console.log(`result: ${JSON.stringify(result)}`);
        return turn;
    }
);