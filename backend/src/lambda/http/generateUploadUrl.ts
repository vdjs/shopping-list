import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUploadUrl } from '../../businessLogic/shoppingItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
console.log("🚀 ~ file: generateUploadUrl.ts ~ line 8 ~ consthandler:APIGatewayProxyHandler= ~ event", event)
  const itemId = event.pathParameters.itemId
  console.log("🚀 ~ file: generateUploadUrl.ts ~ line 7 ~ consthandler:APIGatewayProxyHandler= ~ itemId", itemId)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const uploadUrl = await getUploadUrl(itemId, jwtToken)
  console.log("🚀 ~ file: generateUploadUrl.ts ~ line 12 ~ consthandler:APIGatewayProxyHandler= ~ uploadUrl", uploadUrl)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: uploadUrl
  }
}
