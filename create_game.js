import {IDENTIFIERS} from "./libs/identifiers";
import handler from "./libs/handler-lib";
const ASCII_LIMITS = {start: "A".charCodeAt(), end: "Z".charCodeAt()};
const CODE_NO_CHARS = 4;
import dynamoDb from "./libs/dynamodb-lib";


export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const gameId = generateGameId();
  const params = {
    TableName: process.env.tableName,
    Item: {
      PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`,
      SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`,
      createdAt: Date.now(),
      creator: event.requestContext.identity.cognitoIdentityId,
      game_id: gameId,
      game_name: data.gameName,
      game_type: IDENTIFIERS.GAME_TYPE_BILETZELE,
      no_rounds: 4,
      rounds: [],
      game_status: "Pending",
      players: {
        ids: [],
        playerNames: []
      },
      teams: [{
        name: data.team1,
        members: [],
        score: 0
      }, {
        name: data.team2,
        members: [],
        score: 0
      }],
      turnNumber: 0,
      words: []
    }
  };
  await dynamoDb.put(params);
  console.log(`params: ${JSON.stringify(params)}`);
  console.log(`pk: GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`);
 // console.log(`result: ${JSON.stringify(result)}`);
});

function generateGameId(){
  let code = "";
  for(let i=0; i<CODE_NO_CHARS; i++){
    const random_no = ASCII_LIMITS.start + Math.round(Math.random()*(ASCII_LIMITS.end - ASCII_LIMITS.start));
    code += String.fromCharCode(random_no);
  }
  return code;
}