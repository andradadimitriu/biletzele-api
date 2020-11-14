import AWS from "aws-sdk";
import {IDENTIFIERS} from "./libs/identifiers";
const ASCII_LIMITS = {start: "A".charCodeAt(), end: "Z".charCodeAt()};
const CODE_NO_CHARS = 4;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export function main(event, context, callback) {

  // Request body is passed in as a JSON encoded string in 'event.body'
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
  dynamoDb.put(params, (error, data) => {
    // Set response headers to enable CORS (Cross-Origin Resource Sharing)
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    };

    // Return status code 500 on error
    if (error) {
      console.log(error);//TODO remove
      const response = {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({ status: false })
      };
      callback(null, response);
      return;
    }

    // Return status code 200 and the newly created item
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(params.Item)
    };
    callback(null, response);
  });
}

function generateGameId(){
  let code = "";
  for(let i=0; i<CODE_NO_CHARS; i++){
    const random_no = ASCII_LIMITS.start + Math.round(Math.random()*(ASCII_LIMITS.end - ASCII_LIMITS.start));
    code += String.fromCharCode(random_no);
  }
  return code;
}