import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createShoppingItem, deleteShoppingItem, getShoppingItems, patchShoppingItem } from '../api/shopping-items-api'
import Auth from '../auth/Auth'
import { ShoppingItem } from '../types/ShoppingItem'

interface ShoppingItemsProps {
  auth: Auth
  history: History
}

interface ShoppingItemsState {
  items: ShoppingItem[]
  newItemName: string
  loadingShoppingItems: boolean
}

export class Items extends React.PureComponent<ShoppingItemsProps, ShoppingItemsState> {
  state: ShoppingItemsState = {
    items: [],
    newItemName: '',
    loadingShoppingItems: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemName: event.target.value })
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/item/${itemId}/edit`)
  }

  onItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    console.log("🚀 ~ file: ShoppingItems.tsx ~ line 47 ~ Items ~ onItemCreate= ~ event", event)
    if(this.state.newItemName === "") alert("Name field can't be empty.")
    else{
      try {
        const newItem = await createShoppingItem(this.props.auth.getIdToken(), {
          name: this.state.newItemName
        })
        console.log("🚀 ~ file: ShoppingItems.tsx ~ line 52 ~ Items ~ newItem ~ newItem", newItem)
        this.setState({
          items: [...this.state.items, newItem],
          newItemName: ''
        })
      } catch {
        alert('New Item creation failed')
      }
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteShoppingItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(item => item.itemId != itemId)
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  onItemCheck = async (pos: number) => {
    try {
      const item = this.state.items[pos]
      await patchShoppingItem(this.props.auth.getIdToken(), item.itemId, {
        name: item.name,
        done: !item.done
      })
      this.setState({
        items: update(this.state.items, {
          [pos]: { done: { $set: !item.done } }
        })
      })
    } catch {
      alert('Item status update failed')
    }
  }

  async componentDidMount() {
    try {
      const items = await getShoppingItems(this.props.auth.getIdToken())
      console.log("🚀 ~ file: ShoppingItems.tsx ~ line 93 ~ Items ~ componentDidMount ~ items", items)
      this.setState({
        items,
        loadingShoppingItems: false
      })
    } catch (err) {
      console.log("🚀 ~ file: ShoppingItems.tsx ~ line 99 ~ Items ~ componentDidMount ~ err", err)
      alert(`Failed to fetch items: ${err.message}`)
    }
  }

  render() {
    return (
      <div>
        <br></br>
        <Header className="center" as="h2">Shopping list items</Header>

        {this.renderCreateShoppingItemInput()}

        {this.renderShoppingList()}
      </div>
    )
  }

  renderCreateShoppingItemInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Item To Buy',
              onClick: this.onItemCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Type item name..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderShoppingList() {
    if (this.state.loadingShoppingItems) {
      return this.renderLoading()
    }

    return this.renderShoppingListItems()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderShoppingListItems() {
    return (
      <Grid padded>
        {this.state.items.map((item, pos) => {
          return (
            <Grid.Row key={item.itemId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onItemCheck(pos)}
                  checked={item.done}
                />
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle" className={item.done ? "crossed" : ""}>
                Name: {item.name}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {item.itemImageUrl && (
                  <Image src={item.itemImageUrl} size="small" wrapped />
                )}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle" floated="right">
                Price: {item.price}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle" floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(item.itemId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle" floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onItemDelete(item.itemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>

              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
