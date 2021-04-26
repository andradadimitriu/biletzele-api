import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";
import {IDENTIFIERS} from "./libs/identifiers";
import AWS from "aws-sdk";
import {GAME_STATUS} from "./utils/statuses";

export const enterRoom = handler(async (event) => {
    const connectionId = event.requestContext.connectionId;
    const gameId = JSON.parse(event.body).data;

    const params = {
            TableName: process.env.tableName,
            Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`},
            UpdateExpression: 'ADD connectionIds :connectionSet',
            ExpressionAttributeValues: {
                ':endedGameStatus': GAME_STATUS.ENDED,
                ':connectionSet': dynamoDb.createSet([connectionId]),
                ':connectionId': connectionId,
            },
            ConditionExpression: "not gameStatus =:endedGameStatus AND not contains(connectionIds, :connectionId)",
            ReturnValues:"UPDATED_NEW"
        };
    const result = await dynamoDb.update(params);

    console.log(`result: ${JSON.stringify(result)}`);
        return result;
    }
);

export const connectHandler = handler(async () => {
        console.log(`on connect`);
    }
);

export const disconnectHandler = handler(async () => {
        console.log(`on disconnect`);
    }
);

export async function gameBroadcast(event, gameId, result, dataType){
    if(result && result.Attributes) {
        const dataToSend = {type: dataType, game: result.Attributes};
        console.log("Broadcast change to users");
        await broadcast(event, gameId, result.Attributes.connectionIds, dataToSend);
    }
}

export async function broadcast(event, gameId, connectionIds, dataToSend){
    const endpoint =
        event.requestContext.domainName + '/' + event.requestContext.stage;
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29', //TODO check which date ,
        endpoint: endpoint
    });
    const connectionsToDelete = await sendToClients(apigwManagementApi, connectionIds, dataToSend);
    await deleteStaleConnections(gameId, connectionsToDelete);
    return { statusCode: 200, body: 'Data sent.' };
}

async function deleteStaleConnections(gameId, connectionsToDelete){
    const params = {
        TableName: process.env.tableName,
        Key: { PK:`GAME#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`, SK: `#METADATA#${IDENTIFIERS.GAME_TYPE_BILETZELE}#${gameId}`},
        UpdateExpression: 'DELETE  connectionIds :connectionsToDelete',
        ExpressionAttributeValues: {
            ':connectionsToDelete': dynamoDb.createSet(connectionsToDelete)
        },
        ReturnValues:"UPDATED_NEW"
    };
    return await dynamoDb.update(params);
}

async function sendToClients(apigwManagementApi, connectionIds, dataToSend){
    console.log(`connectionIds: ${JSON.stringify(connectionIds)}`);

    const connectionsToDelete = [];
    if( connectionIds.values[0].length < 1 ){
        connectionIds.values.shift();

    }
    const postRequests = connectionIds.values.map(async (connectionId) => {
        try {
            console.log(`notifying ${connectionId}`);
            return await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(dataToSend) }).promise();
        } catch (e) {
            if (e.statusCode === 410) {
                console.log(`Found stale connection: ${connectionId}`);
                connectionsToDelete.push(connectionId);
            } else {
                console.log(`Something went wrong: ${connectionId}`);
                console.log(`err: ${e}`);
                throw e;
            }
        }
    });

    //TODO is try catch needed?
    // try {
    await Promise.all(postRequests);
    // } catch (e) {
    //     return { statusCode: 500, body: e.stack };
    // }

    console.log(`connectionsToDelete: ${JSON.stringify(connectionsToDelete)}`);
    return connectionsToDelete;
}