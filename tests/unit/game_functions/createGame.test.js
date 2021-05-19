import {main} from '../../../game_functions/create_game.js';
const aws = require('aws-sdk');

const event1 = {
    body: JSON.stringify({
        gameName: "Game 1",
        team1Name: "Team1",
        team2Name: "Team2",

    }),
    requestContext: {
        identity:
            {cognitoIdentityId: "cognito-identity1"}
    }
}

jest.mock('aws-sdk', () => {
    const mDocumentClient = { put: jest.fn(), createSet: jest.fn((list)=>new Set(list)) };
    const mDynamoDB = { DocumentClient: jest.fn(() => mDocumentClient) };
    return { DynamoDB: mDynamoDB };
});
const mDynamoDb = new aws.DynamoDB.DocumentClient();

describe('create game', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    it('successfully create', async () => {
        mDynamoDb.put.mockImplementationOnce(()=>({promise: jest.fn()}));
        await main(event1);
        expect(mDynamoDb.put).toHaveBeenCalledTimes(1);
    });
});
