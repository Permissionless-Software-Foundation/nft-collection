/*
  Component for looking up the balance of a BCH address.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap'
import { SlpMutableData } from 'slp-mutable-data'

// let _this

class GetBalance extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      balance: '',
      textInput: '',
      wallet: props.wallet
    }

    // Encapsulate dependencies
    this.slpMutableData = new SlpMutableData({
      wallet: this.state.wallet
    })

    // Bind 'this' to event handlers
    this.handleGetBalance = this.handleGetBalance.bind(this)

    // _this = this
  }

  render () {
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
        </Container>
      </>
    )
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

      const nfts = []

      // Hydrate the tokens with more data, and filter out any non-NFTs.
      for (let i = 0; i < nftCandidates.length; i++) {
        const thisToken = nftCandidates[i]

        // Get token data for this token.
        const tokenData = await this.slpMutableData.get.data(thisToken.tokenId)
        console.log(`tokenData: ${JSON.stringify(tokenData, null, 2)}`)

        thisToken.tokenData = tokenData

        const category = this.categorizeToken(thisToken)
        console.log('category: ', category)
        if (category !== 'fungible') {
          nfts.push(thisToken)
        }
      }

      console.log(`nfts: ${JSON.stringify(nfts, null, 2)}`)

      this.setState({
        balance: `Balance: ${balance} sats, ${bchBalance} BCH`
      })
    } catch (err) {
      this.setState({
        balance: (<p><b>Error</b>: {`${err.message}`}</p>)
      })
    }
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

export default GetBalance
