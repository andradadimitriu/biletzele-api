import {IDENTIFIERS} from "./libs/identifiers";
import dynamoDb from "./libs/dynamodb-lib";
import handler from "./libs/handler-lib";
import {gameBroadcast} from "./connection";
import {MESSAGE_TYPE} from "./utils/messageTypes";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body).data;
    const params = {
        TableName: process.env.tableName,
        Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${data.gameId}`},
        ExpressionAttributeNames:  {"#teamTurn": data.teamTurn},
        UpdateExpression: `SET rounds[${data.roundNo - 1}].score.#teamTurn =  rounds[${data.roundNo - 1}].score.#teamTurn + :increment, turn.wordIndex =:newWordIndex, turn.lastWordGuessed = :wordGuessed REMOVE rounds[${data.roundNo - 1}].wordsLeft[${data.oldWordIndex}]`,
            ExpressionAttributeValues: {
                ':turnNo': data.turnNo,
                ':wordGuessed': data.wordGuessed,
                ':newWordIndex': data.newWordIndex,
                ':oldWordIndex': data.oldWordIndex,
                ':increment': 1
            },
            ConditionExpression: 'turnNumber = :turnNo AND turnNumber = turn.turnNo AND turn.wordIndex = :oldWordIndex',
        ReturnValues:"ALL_NEW"
        };
        const dynamoDbCall = async() => await dynamoDb.update(params);
        const getDataToSend = (resultAttributes) => { return {timestamp: Date.now(), lastWordGuessed: resultAttributes.turn ? resultAttributes.turn.lastWordGuessed : undefined}; };
        await gameBroadcast(event, data.gameId, dynamoDbCall, MESSAGE_TYPE.NEXT_WORD, true, true, getDataToSend);
    }
);