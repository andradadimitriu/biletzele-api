import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {ROUND_STATUSES} from "./utils/statuses";
export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const prevRoundChecksAttributeValues = data.roundNo <= 1 ? {} :
        {
            ':prevRoundStatus': ROUND_STATUSES.ENDED,
            ':zero': 0
        };
    const round = {
        wordsLeft: data.wordsLeft,
        roundNo: data.roundNo,
        roundStatus: (data.wordsLeft && data.wordsLeft.length > 0) ? ROUND_STATUSES.ACTIVE : ROUND_STATUSES.ENDED
    };
    console.log(`round: ${round}`);
    const conditionalExpr = 'noRounds >= :roundNo AND size(rounds) = :prevRoundNo' +
        (data.roundNo <= 1 ? "" :
            ` AND size(rounds[${data.roundNo - 2}].wordsLeft) = :zero AND rounds[${data.roundNo - 2}].roundStatus = :prevRoundStatus`);
    console.log(`conditionalExpr: ${conditionalExpr}`);
    console.log(`roundNo: ${data.roundNo}`);
    console.log(`prevRoundNo: ${data.roundNo - 1}`);

    //TODO throw error if roundNo <1
    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${event.pathParameters.id}`},
            UpdateExpression: 'SET turnNumber = turnNumber + :increment, rounds = list_append (rounds, :roundList)',
            ExpressionAttributeValues: {
                ':roundList': [round],
                ':roundNo': data.roundNo,
                ':prevRoundNo': data.roundNo - 1,
                ':increment': 1,
                ...prevRoundChecksAttributeValues
            },
            ConditionExpression: conditionalExpr,
        ReturnValues:"UPDATED_NEW"
        };
        const result = await dynamoDb.update(params);
        console.log(`result: ${JSON.stringify(result)}`);
        return result;
    }
);