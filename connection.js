import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";
import {IDENTIFIERS} from "./libs/identifiers";
import AWS from "aws-sdk";

export const connectHandler = handler(async () => {
        console.log(`on connect`);
    }
);


export const disconnectHandler = handler(async () => {
        console.log(`on disconnect`);
    }
);

export const broadcastHandler = handler(async (event) => {
    const gameConnections = await getGameConnections(event.pathParameters.id);
    if (!gameConnections){
        return false;
    }
    return gameConnections.map(connectionId => send(event, connectionId));
    }
);

async function send(event, connectionId){
    const endpoint =
        event.requestContext.domainName + '/' + event.requestContext.stage;
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29', //TODO check which date ,
        endpoint: endpoint
    });

    const params = {
        ConnectionId: connectionId,
        Data: "ping"
    };
    return apigwManagementApi.postToConnection(params).promise();
}

async function getGameConnections(gameId){
    const params = {
        TableName: process.env.tableName,
        Key: {
            PK: `GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}#CONNECTIONS`,
            SK: `#CONNECTIONS`
        }
    };

    const result = await dynamoDb.get(params);
    if ( ! result.Item) {
        return false;
    }
    return result.Item.connectionId;
}