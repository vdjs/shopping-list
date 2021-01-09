import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { ShoppingItem } from '../models/ShoppingItem'
import { UpdateShoppingItemRequest } from '../requests/UpdateShoppingItemRequest'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export class ShoppingItemAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly itemsTable = process.env.SITEMS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  async getAllShoppingItems(userId: string): Promise<ShoppingItem[]> {
    try{
      const result = await this.docClient.query({
        TableName: this.itemsTable,
        IndexName : this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise()
  
      const items = result.Items
      console.log("🚀 ~ file: shoppingItemsAccess.ts ~ line 38 ~ ShoppingItemAccess ~ getAllShoppingItems ~ items", items)
      return items as ShoppingItem[]
    }catch(err){
      console.log("🚀 ~ file: shoppingItemsAccess.ts ~ line 46 ~ ShoppingItemAccess ~ getAllShoppingItems ~ err", err)
    }
    const result = await this.docClient.query({
      TableName: this.itemsTable,
      IndexName : this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items
    console.log("🚀 ~ file: shoppingItemsAccess.ts ~ line 38 ~ ShoppingItemAccess ~ getAllShoppingItems ~ items", items)
    return items as ShoppingItem[]
  }

  async createShoppingItem(ShoppingItem: ShoppingItem): Promise<ShoppingItem> {
    console.log("🚀 ~ file: shoppingItemsAccess.ts ~ line 41 ~ ShoppingItemAccess ~ createShoppingItem ~ ShoppingItem", ShoppingItem)
    await this.docClient.put({
      TableName: this.itemsTable,
      Item: ShoppingItem
    }).promise()
        return ShoppingItem
  }

  async patchShoppingItem(userId: string, itemId: string, UpdateShoppingItemRequest: UpdateShoppingItemRequest): Promise<string> {
    if(UpdateShoppingItemRequest.done){
      await this.docClient.update({
        TableName: this.itemsTable,
        Key: { userId, itemId },
        UpdateExpression: 'set done = :done',
        ExpressionAttributeValues: { ':done': UpdateShoppingItemRequest.done }
      }).promise()
    }else if(UpdateShoppingItemRequest.price){
      await this.docClient.update({
        TableName: this.itemsTable,
        Key: { userId, itemId },
        UpdateExpression: 'set price = :price',
        ExpressionAttributeValues: { ':price': UpdateShoppingItemRequest.price }
      }).promise()
    }
    
    
    return "Status updated!"
  }

  async getUploadUrl(itemId: string, userId: string, imageId: string):Promise<string> {
    console.log("🚀 ~ file: shoppingItemsAccess.ts ~ line 77 ~ ShoppingItemAccess ~ getUploadUrl ~ itemId", itemId)
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
    console.log("🚀 ~ file: shoppingItemsAccess.ts ~ line 83 ~ ShoppingItemAccess ~ getUploadUrl ~ uploadUrl", uploadUrl)

    await this.docClient.update({
      TableName: this.itemsTable,
      Key: { userId, itemId },
      UpdateExpression: 'set itemImageUrl = :itemImageUrl',
      ExpressionAttributeValues: { ':itemImageUrl': `https://${this.bucketName}.s3.amazonaws.com/${imageId}` }
    }).promise()

    return uploadUrl
  }

  async deleteShoppingItem(userId, itemId: string): Promise<object> {
    return this.docClient.delete({
      TableName: this.itemsTable,
      Key: { userId, itemId }
    }).promise()
  }


}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
