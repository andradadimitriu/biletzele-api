import AWS from "aws-sdk";
import {IDENTIFIERS} from "./libs/identifiers";
import handler from "./libs/handler-lib";
const ASCII_LIMITS = {start: "A".charCodeAt(), end: "Z".charCodeAt()};
const CODE_NO_CHARS = 4;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const main = handler( async(event, context) => {
  const data = JSON.parse(event.body);
  const gameId = generateGameId();
  const params = {
    TableName: process.env.tableName,
    Item: {
      PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`,
      SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`,
      createdAt: Date.now(),
      creator: data.creator, //event.requestContext.identity.cognitoIdentityId
      game_id: gameId,
      game_name: data.gameName,
      game_type: IDENTIFIERS.GAME_TYPE_BILETZELE,
      no_rounds: 4,
      rounds: [],
      status: "Pending",
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
  const result = await dynamoDb.put(params, function(err, data) {
    if (err) console.log(err);
    else console.log(`data: ${data}`);
  });
  console.log(`result: ${result}`);
});

function generateGameId(){
  let code = "";
  for(let i=0; i<CODE_NO_CHARS; i++){
    const random_no = ASCII_LIMITS.start + Math.round(Math.random()*(ASCII_LIMITS.end - ASCII_LIMITS.start));
    code += String.fromCharCode(random_no);
  }
  return code;
}