import {IDENTIFIERS} from "./libs/identifiers";
import handler from "./libs/handler-lib";
const ASCII_LIMITS = {start: "A".charCodeAt(), end: "Z".charCodeAt()};
const CODE_NO_CHARS = 4;
const ROUND_NO = 4;
import dynamoDb from "./libs/dynamodb-lib";
import {GAME_STATUSES} from "./utils/statuses";

export const main = handler(async (event) => {
  console.log(`cognito-info:${JSON.stringify(event)}`);
  const data = JSON.parse(event.body);
  const gameId = generateGameId();
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
      noRounds: 4,
      rounds: Array.from({length: ROUND_NO}, (_, index) => ({
        roundNo: index + 1,
        roundStatus: GAME_STATUSES.PENDING
      })),
      gameStatus: GAME_STATUSES.PENDING,
      players: {
        ids: [],
        playerNames: []
      },
      teams: {
        [data.team1Name]: {
          members: [],
          score: 0
        },
        [data.team2Name]: {
          members: [],
          score: 0
      }},
      turnNumber: 0,
      words: []
    }
  };
  await dynamoDb.put(params);
  console.log(`params: ${JSON.stringify(params)}`);
  return gameId;
});

function generateGameId(){
  let code = "";
  for(let i=0; i<CODE_NO_CHARS; i++){
    const random_no = ASCII_LIMITS.start + Math.round(Math.random()*(ASCII_LIMITS.end - ASCII_LIMITS.start));
    code += String.fromCharCode(random_no);
  }
  return code;
}