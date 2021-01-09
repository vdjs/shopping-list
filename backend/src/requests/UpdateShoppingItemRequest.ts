/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateShoppingItemRequest {
  itemId: string
  userId: string
  name: string
  price: number
  done: boolean

}