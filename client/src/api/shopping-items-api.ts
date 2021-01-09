import { apiEndpoint } from '../config'
import { ShoppingItem } from '../types/ShoppingItem';
import { CreateShoppingItemRequest } from '../types/CreateTodoRequest';
import Axios from 'axios'
import { UpdateShoppingItemStatusRequest } from '../types/UpdateShoppingItemStatusRequest';
import { UpdateShoppingItemPriceRequest } from '../types/UpdateShoppingItemPriceRequest';

export async function getShoppingItems(idToken: string): Promise<ShoppingItem[]> {
  const response = await Axios.get(`${apiEndpoint}/items`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  return response.data.newItems
}

export async function createShoppingItem(idToken: string, newShoppingItem: CreateShoppingItemRequest): Promise<ShoppingItem> {
  const response = await Axios.post(`${apiEndpoint}/items`,  JSON.stringify(newShoppingItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.newItem
}

export async function patchShoppingItem(idToken: string, itemId: string, updatedShoppingItem: UpdateShoppingItemStatusRequest): Promise<void> {
  await Axios.patch(`${apiEndpoint}/items/${itemId}`, JSON.stringify(updatedShoppingItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteShoppingItem(idToken: string, itemId: string): Promise<void> {
  await Axios.delete(`${apiEndpoint}/items/${itemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(idToken: string, itemId: string): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/items/${itemId}/image`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

export async function savePrice(idToken: string, itemId: string, updateItemPrice: UpdateShoppingItemPriceRequest): Promise<void> {
  await Axios.patch(`${apiEndpoint}/items/${itemId}`, JSON.stringify(updateItemPrice), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}
