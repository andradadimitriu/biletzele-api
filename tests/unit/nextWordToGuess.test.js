import {main} from '../../next_word_to_guess.js';
const aws = require('aws-sdk');
const expectedUpdateParams = {
    TableName: "testGameTableName",
        Key: { PK: 'GAME#000001#AAAA', SK: '#METADATA#000001#AAAA' },
    ExpressionAttributeNames: { '#teamTurn': 'team1' },
    UpdateExpression: 'SET rounds[0].score.#teamTurn =  rounds[0].score.#teamTurn + :increment, turn.wordIndex =:newWordIndex, turn.lastWordGuessed = :wordGuessed REMOVE rounds[0].wordsLeft[2]',
        ExpressionAttributeValues: {
    ':turnNo': 1,
        ':wordGuessed': 'testword',
        ':newWordIndex': 3,
        ':oldWordIndex': 2,
        ':increment': 1
},
    ConditionExpression: 'turnNumber = :turnNo AND turnNumber = turn.turnNo AND turn.wordIndex = :oldWordIndex',
        ReturnValues: 'ALL_NEW'
};

const event1 = {
    body: JSON.stringify({data: {
            gameId: "AAAA",
            teamTurn: "team1",
            wordGuessed: "testword",
            newWordIndex: 3,
            oldWordIndex: 2,
            turnNo: 1,
            roundNo: 1
        }
    }),
    requestContext: {
        identity:
            {cognitoIdentityId: "cognito-identity1"}
    }
}

jest.mock('aws-sdk', () => {
    const mDocumentClient = { update: jest.fn((params)=> {console.log(params); return {promise: jest.fn(()=>undefined)}})};
    const mDynamoDB = { DocumentClient: jest.fn(() => mDocumentClient) };
    const postToCon = {postToConnection: jest.fn(() => undefined)};
    return { DynamoDB: mDynamoDB, ApiGatewayManagementApi: jest.fn(() => postToCon)};
});

const mDynamoDb = new aws.DynamoDB.DocumentClient();

describe('update next word to guess', () => {
    it('successfully update next word to guess', async () => {
        await main(event1);
        expect(mDynamoDb.update).toHaveBeenCalledWith(expectedUpdateParams);

    });
});
