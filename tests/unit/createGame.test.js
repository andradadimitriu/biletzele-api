import {main} from '../../create_game.js';
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

const expectedGameParams = {
    // TableName: process.env.tableName,
    // Item: {
    //     PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`,
    //     SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`,
    //     createdAt: Date.now(),
    //     creator: event1.requestContext.identity.cognitoIdentityId,
    //     gameId: gameId,
    //     gameName: event1.body.gameName,
    //     gameType: IDENTIFIERS.GAME_TYPE_BILETZELE,
    //     noRounds: 4,
    //     rounds: Array.from({length: ROUND_NO}, (_, index) => ({
    //         roundNo: index + 1,
    //         roundStatus: GAME_STATUS.PENDING,
    //         score: {
    //             [event1.body.team1Name]: 0,
    //             [event1.body.team2Name]: 0
    //         }
    //     })),
    //     gameStatus: GAME_STATUS.PENDING,
    //     players: {
    //         ids: [],
    //         playerNames: []
    //     },
    //     teams: {
    //         [event1.body.team1Name]: {
    //             members: []
    //         },
    //         [event1.body.team2Name]: {
    //             members: []
    //         }
    //     },
    //     turnNumber: 0,
    //     words: [],
    //     connectionIds: dynamoDb.createSet([""])//dummy connection
    // }
};

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
        // mDynamoDb.get.mockImplementationOnce((_, callback) => callback(null, null));
        mDynamoDb.put.mockImplementationOnce((_, callback) => callback(null, null));
        await main(event1);
        expect(mDynamoDb.put).toHaveBeenCalledTimes(1);

    });
});
