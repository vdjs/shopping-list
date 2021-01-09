import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateShoppingItemRequest } from '../../requests/CreateShoppingItemRequest'
import { createShoppingItem } from '../../businessLogic/shoppingItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newShoppingItem: CreateShoppingItemRequest = JSON.parse(event.body)
  console.log("🚀 ~ file: createTodo.ts ~ line 10 ~ consthandler:APIGatewayProxyHandler= ~ newShoppingItem", newShoppingItem)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = await createShoppingItem(newShoppingItem, jwtToken)
  //console.log("🚀 ~ file: createTodo.ts ~ line 16 ~ consthandler:APIGatewayProxyHandler= ~ newItem", newItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newItem
    })
  }
}
