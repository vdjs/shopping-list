export interface ShoppingItem {
  itemId: string
  userId: string
  name: string
  price?: number
  done: boolean
  createdAt: string
  itemImageUrl?: string
}
