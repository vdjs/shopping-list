import * as uuid from 'uuid'

import { ShoppingItem } from '../models/ShoppingItem'
import { ShoppingItemAccess } from '../dataLayer/shoppingItemsAccess'
import { CreateShoppingItemRequest } from '../requests/CreateShoppingItemRequest'
import { UpdateShoppingItemRequest } from '../requests/UpdateShoppingItemRequest'
import { parseUserId } from '../auth/utils'

const shoppingItemAccess = new ShoppingItemAccess()

export async function getAllShoppingItems(jwtToken: string): Promise<ShoppingItem[]> {
  const userId = parseUserId(jwtToken)
  return shoppingItemAccess.getAllShoppingItems(userId)
}

export async function createShoppingItem(
  createTodoRequest: CreateShoppingItemRequest,
  jwtToken: string
): Promise<ShoppingItem> {
  try {
    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
    const items = await shoppingItemAccess.createShoppingItem({
      userId: userId,
      itemId: itemId,
      name: createTodoRequest.name,
      done: false,
      createdAt: new Date().toISOString()
    })
    console.log("🚀 ~ file: shoppingItems.ts ~ line 30 ~ items", items)
    return items
  } catch (err) {
  console.log("🚀 ~ file: shoppingItems.ts ~ line 32 ~ err", err)
  }

}

export async function patchShoppingItem(itemId: string, UpdateShoppingItemRequest: UpdateShoppingItemRequest, jwtToken: string): Promise<string> {
  const userId = parseUserId(jwtToken)
  const result = await shoppingItemAccess.patchShoppingItem(userId, itemId, UpdateShoppingItemRequest)
  return result
}

export async function getUploadUrl(itemId: string, jwtToken: string): Promise<string> {
  console.log("🚀 ~ file: shoppingItems.ts ~ line 45 ~ getUploadUrl ~ itemId", itemId)
  const imageId = uuid.v4()
  const userId = parseUserId(jwtToken)
  console.log("🚀 ~ file: shoppingItems.ts ~ line 48 ~ getUploadUrl ~ userId", userId)
  const uploadUrl = await shoppingItemAccess.getUploadUrl(itemId, userId, imageId)
  return uploadUrl
}

export async function deleteShoppingItem(itemId: string, jwtToken: string): Promise<object> {
  const userId = parseUserId(jwtToken)
  return shoppingItemAccess.deleteShoppingItem(userId, itemId)
}