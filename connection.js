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
            ConditionExpression: "attribute_exists(gameId) AND not gameStatus =:endedGameStatus AND not contains(connectionIds, :connectionId)",
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

export async function gameBroadcast(event, gameId, dynamoDbCall, dataType, confirmSuccess = false, confirmFailure = false, getDataToSend = undefined, replyBackData = {}){
    const apigwManagementApi = getConfiguredApigwManagementApi(event);
    const connectionId = event.requestContext.connectionId;
    let result;
    try {
        result = await dynamoDbCall();
        console.log(`result: ${JSON.stringify(result)}`);
    }
    catch (e){
        console.log(`e:${JSON.stringify(e)}`);
        if(confirmFailure){
            console.log("confirms failure");
            return await replyBack(apigwManagementApi, connectionId, {type: `${dataType}_FAILURE`, err: e.code, ...replyBackData});
        }
    }

    if(result && result.Attributes) {
        console.log("results");

        if(confirmSuccess){
            console.log("confirms success");
            await replyBack(apigwManagementApi, connectionId, {type: `${dataType}_SUCCESS`, ...replyBackData});
        }
        console.log("Broadcast change to users");
        await broadcast(apigwManagementApi, gameId, result.Attributes.connectionIds, getDataToSend ? {type: dataType, ...getDataToSend(result.Attributes)} : {type: dataType, ...{game: result.Attributes}});
    }


}

export async function replyBack(apigwManagementApi, connectionId, dataToSend){
    return await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(dataToSend) }).promise();
}

export async function broadcast(apigwManagementApi, gameId, connectionIds, dataToSend){
    const connectionsToDelete = await sendToClients(apigwManagementApi, connectionIds, dataToSend);
    await deleteStaleConnections(gameId, connectionsToDelete);
    return { statusCode: 200, body: 'Data sent.' };
}

export function getConfiguredApigwManagementApi(event){
    const endpoint =
        event.requestContext.domainName + '/' + event.requestContext.stage;
    return new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29', //TODO check which date ,
        endpoint: endpoint
    });
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
    console.log(`connection 0:${connectionIds.values[0]}`);
    console.log(`length:${connectionIds.values[0].length}`);
    if( connectionIds.values[0].length < 1 ){
        connectionsToDelete.push(connectionIds.values.shift());
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