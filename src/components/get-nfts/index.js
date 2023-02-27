/*
  Component for looking up the balance of a BCH address.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Form, Button, Spinner, Card } from 'react-bootstrap'
import { SlpMutableData } from 'slp-mutable-data'
import Jdenticon from '@chris.troutner/react-jdenticon'
import RetryQueue from '@chris.troutner/retry-queue'
import { useQueryParam, StringParam } from 'use-query-params'

// Local libraries
import TokenCard from './token-card.js'
import DemoFilter from './demo.js'

let targetBchAddr = ''

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
      wallet: this.state.wallet,
      ipfsGatewayUrl: 'p2wdb-gateway-678.fullstack.cash',
      serverURL: 'https://p2wdb.fullstack.cash'
    })
    this.retryQueue = new RetryQueue({ retryPeriod: 1000, concurrency: 3 })
    this.demoFilter = new DemoFilter()

    // Bind 'this' to event handlers
    this.handleGetTokens = this.handleGetTokens.bind(this)
    this.updateToken = this.updateToken.bind(this)

    // _this = this
  }

  async componentDidMount () {
    console.log('targetBchAddr: ', targetBchAddr)

    if (targetBchAddr.includes('bitcoincash:')) {
      await this.setState({ textInput: targetBchAddr })

      console.log(`Starting handleGetTokens() with ${targetBchAddr}`)

      // Should I await?
      this.handleGetTokens()
    }
  }

  render () {
    const tokenCards = this.generateCards()

    return (

      <>
        <GetRestUrl />
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

      console.log(`Getting NFTs for address ${textInput}`)

      // Exit on invalid input
      if (!textInput) return
      if (!textInput.includes('bitcoincash:')) return

      this.setState({
        balance: (<span>Retrieving NFTs... <Spinner animation='border' /></span>)
      })

      let tokens = await this.state.wallet.listTokens(textInput)
      // console.log(`tokens: ${JSON.stringify(tokens, null, 2)}`)

      // If this is the demo address, then filter out any unexpected tokens.
      tokens = this.demoFilter.filterDemoTokens(textInput, tokens)
      // console.log(`tokens after demoFilter: ${JSON.stringify(tokens, null, 2)}`)

      // Filter out any tokens that do not meet requirements to be NFTs.
      const nftCandidates = tokens.filter(x => x.qty === 1 && x.decimals === 0)
      // console.log(`nftCandidates: ${JSON.stringify(nftCandidates, null, 2)}`)

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
      // console.log(`thisToken: ${JSON.stringify(thisToken, null, 2)}`)

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
      const wallet = this.state.wallet
      const tokenData = await wallet.getTokenData2(token.tokenId)
      console.log(`tokenData: ${JSON.stringify(tokenData, null, 2)}`)

      token.tokenData = tokenData

      const category = await this.categorizeToken(token)
      console.log('category: ', category)
      if (category === 'fungible') {
      // nfts.push(thisToken)
        console.log(`Ignoring fungible token ${token.ticker} (${token.tokenId})`)

        // ToDo: Delete this token from the this.state.tokens array.
        return false
      }
      token.nftType = category

      // Replace the default token icon url if an optimized URL exists.
      if (tokenData.optimizedTokenIcon) {
        tokenData.tokenIcon = tokenData.optimizedTokenIcon
      }

      // Replace the autogenerated token if the tokenIcon property is defined
      // in the mutable data.
      // if (token.tokenData.mutableData.tokenIcon) {
      if (tokenData.tokenIcon) {
        // const tokenIcon = token.tokenData.mutableData.tokenIcon
        const tokenIcon = tokenData.tokenIcon
        console.log(`tokenIcon: ${tokenIcon}`)

        let newIcon

        // Only execute if the token icon does equal the default value of
        // tokens.bch.sx. That indicates that there is no icon available.
        if (!tokenIcon.includes('tokens.bch.sx')) {
          // Be default, link to the token icon.
          newIcon = (
            <a href={tokenIcon} target='_blank' rel='noreferrer'>
              <Card.Img src={tokenIcon} style={{ width: '200px' }} />
            </a>
          )

          // If the fullSizedUrl is specified, link to that.
          if (token.tokenData.mutableData) {
            const fullSizedUrl = token.tokenData.mutableData.fullSizedUrl
            if (fullSizedUrl) {
              newIcon = (
                <a href={fullSizedUrl} target='_blank' rel='noreferrer'>
                  <Card.Img src={tokenIcon} style={{ width: '200px' }} />
                </a>
              )
            }

            // Extract the category from the mutable data, if it exists.
            if (token.tokenData.mutableData.category) {
              token.category = this.capitalizeFirstLetter(token.tokenData.mutableData.category)
            }
          } else {
            console.log(`Token ${token.tokenData.tokenId} has no mutable data. Skipping.`)
          }

          token.icon = newIcon
        }
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
    // console.log(`Replaced tokens element ${elem}`)

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
      // console.log(`categorizeTokens() tokenData: ${JSON.stringify(tokenData, null, 2)}`)

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
      // console.log(`isType1: ${isType1}, hasNoMintingBaton: ${hasNoMintingBaton}, hasNoDecimals: ${hasNoDecimals}, hasQtyOfOne: ${hasQtyOfOne}`)

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

// Get the restURL query parameter.
function GetRestUrl (props) {
  const [bchAddr] = useQueryParam('addr', StringParam)
  // console.log('restURL: ', restURL)

  if (bchAddr) {
    targetBchAddr = bchAddr
    // queryParamExists = true
  }

  return (<></>)
}

export default GetNfts
