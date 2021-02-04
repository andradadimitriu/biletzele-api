import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    console.log(`data: ${JSON.stringify(data)}`);
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: `REMOVE rounds[${data.roundNo - 1}].wordsLeft[${data.oldWordIndex}] SET rounds[${data.roundNo - 1}].score.${data.teamTurn} =  rounds[${data.roundNo - 1}].score.${data.teamTurn} + :increment, turn.wordIndex =:newWordIndex`,
            ExpressionAttributeValues: {
                ':turnNo': data.turnNo,
                ':newWordIndex': data.newWordIndex,
                ':oldWordIndex': data.oldWordIndex,
                ':increment': 1
            },
            ConditionExpression: 'turnNumber = :turnNo AND turnNumber = turn.turnNo AND turn.wordIndex = :oldWordIndex',
        ReturnValues:"UPDATED_NEW"
        };
        const result = await dynamoDb.update(params);
        console.log(`result: ${JSON.stringify(result)}`);
        return result;
    }
);