import {IDENTIFIERS} from "../libs/identifiers";
import handler from "../libs/handler-lib";

const ASCII_LIMITS = {start: "A".charCodeAt(), end: "Z".charCodeAt()};
const CODE_NO_CHARS = 4;
import dynamoDb from "../libs/dynamodb-lib";
import {GAME_STATUS} from "../utils/statuses";

export const main = handler(async (event) => {
    console.log(`event:${JSON.stringify(event)}`);
    const data = JSON.parse(event.body);
    const gameId = generateGameId();
    console.log(`gameId:${gameId}`);
    const params = {
        TableName: process.env.tableName,
        Item: {
            PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`,
            SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`,
            createdAt: Date.now(),
            creator: event.requestContext.identity.cognitoIdentityId,
            gameId: gameId,
            gameName: data.gameName,
            gameType: IDENTIFIERS.GAME_TYPE_BILETZELE,
            noRounds: data.rounds.length,
            rounds: data.rounds.map((roundType, index) => ({
                roundNo: index + 1,
                roundType,
                roundStatus: GAME_STATUS.PENDING,
                score: {
                    [data.team1Name]: 0,
                    [data.team2Name]: 0
                }
            })),
            gameStatus: GAME_STATUS.PENDING,
            players: {
                ids: [],
                playerNames: []
            },
            teams: {
                [data.team1Name]: {
                    members: {}
                },
                [data.team2Name]: {
                    members: {}
                }
            },
            turnNumber: 0,
            words: [],
            connectionIds: dynamoDb.createSet([""])//dummy connection
        }
    };
    console.log(`params:${params}`);
    await dynamoDb.put(params);
    return gameId;
});

function generateGameId() {
    let code = "";
    for (let i = 0; i < CODE_NO_CHARS; i++) {
        const random_no = ASCII_LIMITS.start + Math.round(Math.random() * (ASCII_LIMITS.end - ASCII_LIMITS.start));
        code += String.fromCharCode(random_no);
    }
    return code;
}