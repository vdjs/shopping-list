import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateShoppingItemRequest } from '../../requests/UpdateShoppingItemRequest'
import { patchShoppingItem } from '../../businessLogic/shoppingItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = event.pathParameters.itemId
  const updatedItem: UpdateShoppingItemRequest = JSON.parse(event.body)
  console.log("🚀 ~ file: updateShoppingItem.ts ~ line 11 ~ consthandler:APIGatewayProxyHandler= ~ updatedItem", updatedItem)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const updatedItemResult = await patchShoppingItem(itemId, updatedItem, jwtToken)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      updatedItemResult
    })
  }
}
