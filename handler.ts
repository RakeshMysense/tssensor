import { APIGatewayEvent, APIGatewayProxyHandler, Callback, Context } from 'aws-lambda';

import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new DynamoDB.DocumentClient();

export const createItem: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context, callback: Callback) =>  {
  console.log("Ok")
  console.log({event})
  console.log("Was here")
  if (!(event.body)) {
    return {
        statusCode: 400,
        body: JSON.stringify({ "error": "body is invalid" })
      };
    }
 
    const body = JSON.parse(event.body);
  const d = body.data;
  if (!d) {
    return {
        statusCode: 400,
        body: JSON.stringify({ "error": "data is having an invalid value" })
      };
    }
  const data = JSON.parse(event.body);
  const params = {
    TableName: 'SensorDataTable',
    Item: {
      sensorid: uuidv4(),
      data: data.data
    }
  };
    console.log("Was here")
  await dynamoDb.put(params).promise();
    
  return {
    statusCode: 200,
    body: JSON.stringify(params.Item)
  };
};

export const getItems = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  console.log({event});

  const params = {
    TableName: 'SensorDataTable',
    Key: {
      sensorid: event.pathParameters!.sensorid
    }
  };
  console.log({params});
    // const result={Item:true};
  const result = await dynamoDb.get(params).promise();
  console.log({ result });
    
  if (result.Item) {
    console.log('got item, this is ok');
    return {
      statusCode: 200,
      body: JSON.stringify({data:result.Item})
    };
  } else {
    console.log('no item, return 404');
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Item not found' })
    };
  }
};

export const updateItem = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const sensorid = event.pathParameters!.sensorid;
  if (!event.body) {
    return {
        statusCode: 400,
        body: JSON.stringify({ "error": "body is invalid" })
      };
    }
    // Check if sensorId is present in the database
    const result = await dynamoDb.get({
        TableName: 'SensorDataTable',
        Key: {
            sensorid: sensorid
        }
    }).promise();
    console.log({result});
    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Sensor not found'
            })
        }
    }
    console.log(event.body)
    const body = JSON.parse(event.body);
    const da = body.data;
    if (!da) {
      return {
          statusCode: 400,
          body: JSON.stringify({ "error": "data is having an invalid value" })
        };
      }
    
    const d = JSON.parse(event.body);
    console.log({d})
    console.log(d.data)
    const params = {
        TableName: 'SensorDataTable',
        Key: {
            sensorid: sensorid
        },
        UpdateExpression: 'SET #ts = :s',
        ExpressionAttributeValues: {
            ':s': d.data
        },
        ExpressionAttributeNames:{
          "#ts": "data"
        },
        
        ReturnValues: 'UPDATED_NEW'
    };
    
    await dynamoDb.update(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Data updated successfully'
        })
    }
};

export const deleteItem = async(event: APIGatewayEvent, context: Context, callback: Callback) => {
  const sensorid = event.pathParameters!.sensorid;
  const params = {
    TableName: 'SensorDataTable',
    Key: {
      sensorid: event.pathParameters!.sensorid
    }
  };
  const result = await dynamoDb.get({
    TableName: 'SensorDataTable',
    Key: {
        sensorid: sensorid
    }
    }).promise();
    console.log({result});
    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Sensor not found'
        })
    }
}  
  await dynamoDb.delete(params).promise();
    
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Item deleted' })
  };
};
