import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, savePrice } from '../api/shopping-items-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

enum SaveState {
  NotSaved,
  SavingPrice
}

interface EditItemsProps {
  match: {
    params: {
      itemId: string
    }
  }
  auth: Auth
}

interface EditItemsState {
  file: any
  price: any
  saveState: SaveState
  uploadState: UploadState
}

export class EditItem extends React.PureComponent<
  EditItemsProps,
  EditItemsState
  > {
  state: EditItemsState = {
    file: undefined,
    price: null,
    saveState: SaveState.NotSaved,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🚀 ~ file: EditShoppingItems.tsx ~ line 45 ~ event", event)
    const price = event.target.value
    if (!price) return

    this.setState({
      price: price
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.itemId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  handlePriceSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    try {
      if (!this.state.price) {
        alert('Price can\'t be empty')
        return
      }
      const priceObj  = { price: this.state.price }
      this.setSaveState(SaveState.SavingPrice)
      console.log("🚀 ~ file: EditShoppingItems.tsx ~ line 95 ~ handlePriceSubmit= ~ priceObj", priceObj)
      await savePrice(this.props.auth.getIdToken(), this.props.match.params.itemId, priceObj)

      alert('Price was saved!')
    } catch (e) {
      alert('Could not save price: ' + e.message)
    } finally {
      this.setSaveState(SaveState.NotSaved)
    }

  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  setSaveState(saveState: SaveState) {
    this.setState({
      saveState
    })
  }

  render() {
    return (
      <div>
        <div>
          <h1>Upload new image</h1>

          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <label>File</label>
              <input
                type="file"
                accept="image/*"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
              />
            </Form.Field>

            {this.renderUploadButton()}
          </Form>
        </div>
        <div>
          <h1>Update Price</h1>

          <Form onSubmit={this.handlePriceSubmit}>
            <Form.Field>
              <label>Price</label>
              <input
                type="number"
                placeholder="Add/Edit Price"
                onChange={this.handlePriceChange}
              />
            </Form.Field>

            {this.renderPriceButton()}
          </Form>
        </div>
      </div>
    )
  }

  renderUploadButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
  renderPriceButton() {
    return (
      <div>
        {this.state.saveState === SaveState.SavingPrice && <p>Saving Price</p>}
        <Button
          loading={this.state.saveState !== SaveState.NotSaved}
          type="submit"
        >
          Save/Update
        </Button>
      </div>
    )
  }
}
