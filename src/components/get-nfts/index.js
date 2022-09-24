/*
  Component for looking up the balance of a BCH address.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Form, Button, Spinner, Card } from 'react-bootstrap'
import { SlpMutableData } from 'slp-mutable-data'
import Jdenticon from '@chris.troutner/react-jdenticon'
import RetryQueue from '@chris.troutner/retry-queue'
// import axios from 'axios'

// Local libraries
import TokenCard from './token-card.js'

// let _this

class GetNfts extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      balance: '',
      textInput: '',
      wallet: props.wallet,
      tokens: [],
      iconsAreLoaded: true
    }

    // Encapsulate dependencies
    this.slpMutableData = new SlpMutableData({
      wallet: this.state.wallet
    })
    this.retryQueue = new RetryQueue({ retryPeriod: 1000, concurrency: 3 })

    // Bind 'this' to event handlers
    this.handleGetTokens = this.handleGetTokens.bind(this)
    this.updateToken = this.updateToken.bind(this)

    // _this = this
  }

  render () {
    const tokenCards = this.generateCards()

    return (

      <>
        <Container>
          <Row>
            <Col className='text-break' style={{ textAlign: 'center' }}>
              <Form>
                <Form.Group className='mb-3' controlId='formBasicEmail'>
                  <Form.Label>Enter a BCH address to retrieve the NFTs it holds.</Form.Label>
                  <Form.Control type='text' placeholder='bitcoincash:qqlrzp23w08434twmvr4fxw672whkjy0py26r63g3d' onChange={e => this.setState({ textInput: e.target.value })} />
                </Form.Group>

                <Button variant='primary' onClick={this.handleGetTokens}>
                  Get NFT Collection
                </Button>
              </Form>
            </Col>
          </Row>
          <br />
          <Row>
            <Col style={{ textAlign: 'center' }}>
              {this.state.balance}
            </Col>
          </Row>
          <br />

          <Row>
            <Col xs={8} />
            <Col xs={4} style={{ textAlign: 'right' }}>
              {
                this.state.iconsAreLoaded
                  ? null
                  : (<Button variant='secondary'>Loading Token Data <Spinner animation='border' /></Button>)
              }
            </Col>
          </Row>

          {tokenCards}

        </Container>
      </>
    )
  }

  generateCards () {
    const tokens = this.state.tokens

    // const tokenCards = []
    // const categories = []

    // Create a 'collections' object to hold a collection of catgorized tokens.
    const collections = {
      categories: []
    }

    for (let i = 0; i < tokens.length; i++) {
      const thisToken = tokens[i]
      // console.log(`thisToken: ${JSON.stringify(thisToken, null, 2)}`)

      // If the token does not have a defined category, then put it in the
      // 'uncagorized' category.
      if (!thisToken.category) {
        thisToken.category = 'Uncategorized'
      }

      // If the token category does not exist in the collections object, add it.
      if (!collections[thisToken.category]) {
        collections[thisToken.category] = []
        collections.categories.push(thisToken.category)
      }

      // Add the token card to the appropriate category
      const thisTokenCard = (
        <TokenCard
          token={thisToken}
          key={`${thisToken.tokenId}`}
        />
      )
      // tokenCards.push(thisTokenCard)
      collections[thisToken.category].push(thisTokenCard)
    }

    const allCategories = []

    // Assemble the collection into JSX
    for (let i = 0; i < collections.categories.length; i++) {
      const thisCategory = collections.categories[i]
      const categoryTokens = collections[thisCategory]

      const header = (<h3>{thisCategory}</h3>)

      // Loop through each card in the category.
      // for(let j =0; j < categoryTokens.length; j++) {
      //
      // }

      const categoryJsx = (
        <div key={thisCategory}>
          <Row>
            {header}
          </Row>
          <Row>
            {categoryTokens}
          </Row>
          <br />
        </div>
      )

      allCategories.push(categoryJsx)
    }

    return allCategories
  }

  async handleGetTokens (event) {
    try {
      const textInput = this.state.textInput

      // Exit on invalid input
      if (!textInput) return
      if (!textInput.includes('bitcoincash:')) return

      this.setState({
        balance: (<span>Retrieving NFTs... <Spinner animation='border' /></span>)
      })

      const balance = await this.state.wallet.getBalance(textInput)
      console.log('balance: ', balance)

      // const utxos = await this.state.wallet.getUtxos(textInput)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      // const bchBalance = this.state.wallet.bchjs.BitcoinCash.toBitcoinCash(balance)

      const tokens = await this.state.wallet.listTokens(textInput)
      // console.log(`tokens: ${JSON.stringify(tokens, null, 2)}`)

      // Filter out any tokens that do not meet requirements to be NFTs.
      const nftCandidates = tokens.filter(x => x.qty === 1 && x.decimals === 0)
      console.log(`nftCandidates: ${JSON.stringify(nftCandidates, null, 2)}`)

      // Add the JDenticon icon
      nftCandidates.map((x) => {
        x.icon = (<Jdenticon size='100' value={x.tokenId} />)
        x.iconNeedsDownload = true

        return true
      })

      // This is an async function, but is deliberately called without 'await',
      // so that it does not block execution.
      this.lazyLoadTokenIcons(nftCandidates)

      this.setState({
        // balance: `Balance: ${balance} sats, ${bchBalance} BCH`,
        balance: '',
        tokens: nftCandidates,
        iconsAreLoaded: false
      })
    } catch (err) {
      this.setState({
        balance: (<p><b>Error</b>: {`${err.message}`}</p>)
      })
    }
  }

  async lazyLoadTokenIcons (tokens) {
    for (let i = 0; i < tokens.length; i++) {
      const thisToken = tokens[i]
      console.log(`thisToken: ${JSON.stringify(thisToken, null, 2)}`)

      // Add the token data download to the queue.
      this.retryQueue.addToQueue(this.updateToken, thisToken)
    }

    // Wait for all requests in the queue to be processed.
    await this.retryQueue.validationQueue.onIdle()
    console.log('Retry queue is empty!')

    this.setState({ iconsAreLoaded: true })
  }

  // This is a Promise-based function that accepts an object as input, so that
  // it can be added to the Retry Queue. It downloads the mutable and immutable
  // data for a token, then updates the icon with the URL from the mutable data.
  async updateToken (token) {
    try {
    // Get token data for this token.
      const tokenData = await this.slpMutableData.get.data(token.tokenId)
      // console.log(`tokenData: ${JSON.stringify(tokenData, null, 2)}`)

      token.tokenData = tokenData

      const category = await this.categorizeToken(token)
      if (category === 'fungible') {
      // nfts.push(thisToken)
        console.log(`Ignoring fungible token ${token.ticker} (${token.tokenId})`)

        // ToDo: Delete this token from the this.state.tokens array.
        return false
      }

      // Replace the autogenerated token if the tokenIcon property is defined
      // in the mutable data.
      if (token.tokenData.mutableData.tokenIcon) {
        const tokenIcon = token.tokenData.mutableData.tokenIcon

        const newIcon = (
          <Card.Img src={tokenIcon} style={{ width: '200px' }} />
        )

        token.icon = newIcon
      }

      // Extract the category from the mutable data, if it exists.
      if (token.tokenData.mutableData.category) {
        token.category = this.capitalizeFirstLetter(token.tokenData.mutableData.category)
      }

      // Signal that a token download has been attempted.
      token.iconNeedsDownload = false

      // Update the token state for this token.
      this.persistTokenUpdate(token)

      return token
    } catch (err) {
      console.log('Error in updateToken(): ', err)
      throw err
    }
  }

  // Given a token object, this function updates the app state for only that token.
  persistTokenUpdate (token) {
    const stateTokens = this.state.tokens

    // Find the element that matches the given token.
    let elem = null
    for (let i = 0; i < stateTokens.length; i++) {
      if (stateTokens[i].tokenId === token.tokenId) {
        elem = i
        break
      }
    }

    if (elem === null) return

    stateTokens[elem] = token
    console.log(`Replaced tokens element ${elem}`)

    this.setState({ tokens: stateTokens })
  }

  // Categorize the token for display purposes. This will categorize a token
  // into one of these categories:
  // - nft
  // - group
  // - fungible
  // - simple-nft
  //
  // The first three are easy to categorize. The simple-nft is a fungible token
  // with a quantity of 1, decimals of 0, and no minting baton. Categorizing this
  // type of token is the main reason why this function exists.
  //
  // TODO: Rename this to detectNft()
  async categorizeToken (token) {
    try {
      const tokenData = token.tokenData
      console.log(`categorizeTokens() tokenData: ${JSON.stringify(tokenData, null, 2)}`)

      // console.log(`categorizeToken(): ${JSON.stringify(offerData, null, 2)}`)

      // const tokenId = offerData.tokenId
      //
      // const tokenData = await this.adapters.wallet.bchWallet.getTokenData(tokenId)
      // console.log(`tokenData: ${JSON.stringify(tokenData, null, 2)}`)

      if (tokenData.tokenStats.type === 65) {
        return 'nft'
      }

      // Create a set of checks to detect a simple NFT
      const isType1 = tokenData.tokenStats.type === 1
      const hasNoMintingBaton = !tokenData.tokenStats.mintBatonIsActive
      const hasNoDecimals = !tokenData.tokenStats.decimals
      const hasQtyOfOne = parseInt(tokenData.tokenStats.tokensInCirculationStr) === 1
      console.log(`isType1: ${isType1}, hasNoMintingBaton: ${hasNoMintingBaton}, hasNoDecimals: ${hasNoDecimals}, hasQtyOfOne: ${hasQtyOfOne}`)

      if (isType1 && hasNoMintingBaton && hasNoDecimals && hasQtyOfOne) {
        return 'simple-nft'
      }

      if (isType1) return 'fungible'

      throw new Error(`Unknown token type: ${tokenData.tokenStats.type}`)
    } catch (err) {
      console.error('Error in categorizeToken(): ', err)
      throw err
    }
  }

  // Given a string, this function will ensure the first letter is capitalized,
  // and the rest of the word is lower case.
  capitalizeFirstLetter (inStr) {
    if (typeof inStr !== 'string') return ''

    let outStr = inStr.toLowerCase()

    outStr = outStr.charAt(0).toUpperCase() + outStr.slice(1)

    return outStr
  }
}

export default GetNfts
