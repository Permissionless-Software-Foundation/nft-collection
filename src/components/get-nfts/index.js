/*
  Component for looking up the balance of a BCH address.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Form, Button, Spinner, Card } from 'react-bootstrap'
import { SlpMutableData } from 'slp-mutable-data'
import Jdenticon from '@chris.troutner/react-jdenticon'
import RetryQueue from '@chris.troutner/retry-queue'
import axios from 'axios'

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
      tokens: []
    }

    // Encapsulate dependencies
    this.slpMutableData = new SlpMutableData({
      wallet: this.state.wallet
    })
    this.retryQueue = new RetryQueue({ retryPeriod: 1000, concurrency: 3 })

    // Bind 'this' to event handlers
    this.handleGetBalance = this.handleGetBalance.bind(this)

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
                  <Form.Label>Enter a BCH address to check the balance.</Form.Label>
                  <Form.Control type='text' placeholder='bitcoincash:qqlrzp23w08434twmvr4fxw672whkjy0py26r63g3d' onChange={e => this.setState({ textInput: e.target.value })} />
                </Form.Group>

                <Button variant='primary' onClick={this.handleGetBalance}>
                  Check Balance
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
        thisToken.category = 'uncategorized'
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

  async handleGetBalance (event) {
    try {
      const textInput = this.state.textInput

      // Exit on invalid input
      if (!textInput) return
      if (!textInput.includes('bitcoincash:')) return

      this.setState({
        balance: (<span>Retrieving balance... <Spinner animation='border' /></span>)
      })

      const balance = await this.state.wallet.getBalance(textInput)
      console.log('balance: ', balance)

      // const utxos = await this.state.wallet.getUtxos(textInput)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      const bchBalance = this.state.wallet.bchjs.BitcoinCash.toBitcoinCash(balance)

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
      this.lazyLoadTokenIcons()

      // const nfts = []
      //
      // // Hydrate the tokens with more data, and filter out any non-NFTs.
      // for (let i = 0; i < nftCandidates.length; i++) {
      //   const thisToken = nftCandidates[i]
      //
      //   // Get token data for this token.
      //   const tokenData = await this.slpMutableData.get.data(thisToken.tokenId)
      //   console.log(`tokenData: ${JSON.stringify(tokenData, null, 2)}`)
      //
      //   thisToken.tokenData = tokenData
      //
      //   const category = this.categorizeToken(thisToken)
      //   if (category !== 'fungible') {
      //     nfts.push(thisToken)
      //   }
      // }
      //
      // console.log(`nfts: ${JSON.stringify(nfts, null, 2)}`)

      this.setState({
        balance: `Balance: ${balance} sats, ${bchBalance} BCH`,
        tokens: nftCandidates
      })
    } catch (err) {
      this.setState({
        balance: (<p><b>Error</b>: {`${err.message}`}</p>)
      })
    }
  }

  // This function is called by the componentDidMount() lifecycle function.
  // It replaces the autogenerated token icons with proper icons, downloaded
  // from the internet.
  async lazyLoadTokenIcons () {
    const tokens = this.state.appData.bchWalletState.slpTokens
    // console.log(`lazy loading these tokens: ${JSON.stringify(tokens, null, 2)}`)

    for (let i = 0; i < tokens.length; i++) {
      const thisToken = tokens[i]
      let tokenFound = false

      // if (thisToken.iconNeedsDownload) {
      //   console.log(`token ${thisToken.tokenId} needs icon download`)
      // }

      // If the URL property of the token has an IPFS CID, then it probably
      // follows the PS002 specification for tokens. Download the token icon
      // and replace the Jdenticon automatically-generated icon.
      if (thisToken.url.includes('ipfs://') && thisToken.iconNeedsDownload) {
        const wallet = this.state.appData.bchWallet

        // Retrieve token data from psf-slp-indexer.
        const tokenData = await wallet.getTokenData(thisToken.tokenId)
        // console.log(`tokenData: ${JSON.stringify(tokenData, null, 2)}`)

        // If the token has mutable data, then try to retrieve it from IPFS.
        if (tokenData.mutableData && tokenData.mutableData.includes('ipfs://')) {
          const cid = tokenData.mutableData.substring(7)
          // console.log('cid')

          // Retrieve the mutable data from Filecoin/IPFS.
          const url = `https://${cid}.ipfs.dweb.link/data.json`
          const result = await axios.get(url)

          const mutableData = result.data
          // console.log(`mutableData: ${JSON.stringify(mutableData, null, 2)}`)

          const tokenIcon = mutableData.tokenIcon

          const newIcon = (
            <Card.Img src={tokenIcon} style={{ width: '100px' }} />
          )

          tokenFound = true

          // Add the JSX for the icon to the token object.
          thisToken.icon = newIcon
        }
      }

      // If the token does not have mutable data to store icon data,
      // Check the slp-token-icon GitHub repository for an icon:
      // https://github.com/kosinusbch/slp-token-icons
      if (!tokenFound && thisToken.iconNeedsDownload) {
        const url = `https://tokens.bch.sx/100/${thisToken.tokenId}.png`
        // console.log('url: ', url)

        // Check to see if icon exists. If it doesn't, axios will throw an error
        // and this function can exit.
        try {
          await axios.get(url)

          const newIcon = (
            <Card.Img src={url} style={{ width: '100px' }} />
          )

          // Add the JSX for the icon to the token object.
          thisToken.icon = newIcon
        } catch (err) {
          /* exit quietly */
        }
      }

      // Signal that a token download has been attempted.
      thisToken.iconNeedsDownload = false
    }

    // Update the state of the wallet with the balances
    this.state.appData.updateBchWalletState({ slpTokens: tokens })

    this.setState({
      iconsAreLoaded: true
    })
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
  async categorizeToken (token) {
    try {
      const tokenData = token.tokenData

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
}

export default GetNfts
