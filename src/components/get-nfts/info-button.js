/*
  This component renders as a button. When clicked, it opens a modal that
  displays information about the token.

  This is a functional component with as little state as possible.
*/

// Global npm libraries
import React, { useState } from 'react'
import { Button, Modal, Container, Row, Col } from 'react-bootstrap'

// Takes a string as input. If it matches a pattern for a link, a JSX object is
// returned with a link. Otherwise the original string is returned.
function linkIfUrl (url) {
  // Convert the URL into a link if it contains 'http'
  if (url.includes('http')) {
    url = (<a href={url} target='_blank' rel='noreferrer'>{url}</a>)

    //
  } else if (url.includes('ipfs://')) {
    // Convert to a Filecoin link if its an IPFS reference.

    const cid = url.substring(7)
    url = (<a href={`https://${cid}.ipfs.dweb.link/data.json`} target='_blank' rel='noreferrer'>{url}</a>)
  }

  return url
}

function InfoButton (props) {
  const [show, setShow] = useState(false)

  const handleClose = () => {
    setShow(false)
    // props.instance.setState({ showModal: false })
  }

  const handleOpen = () => {
    setShow(true)
  }

  // console.log('props.token: ', props.token)

  let tags = ''
  let url = ''
  let nsfw = false
  if (props.token.tokenData && props.token.tokenData.mutableData) {
    tags = props.token.tokenData.mutableData.tags.join(',')
    url = linkIfUrl(props.token.tokenData.mutableData.fullSizedUrl)
    nsfw = props.token.tokenData.mutableData.nsfw
  }

  return (
    <>
      <Button variant='info' onClick={handleOpen}>Info</Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Token Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col xs={4}><b>Ticker</b>:</Col>
              <Col xs={8}>{props.token.ticker}</Col>
            </Row>

            <Row style={{ backgroundColor: '#eee' }}>
              <Col xs={4}><b>Name</b>:</Col>
              <Col xs={8}>{props.token.name}</Col>
            </Row>

            <Row>
              <Col xs={4}><b>Token ID</b>:</Col>
              <Col xs={8} style={{ wordBreak: 'break-all' }}>
                <a href={`https://token.fullstack.cash/?tokenid=${props.token.tokenId}`} target='_blank' rel='noreferrer'>
                  {props.token.tokenId}
                </a>
              </Col>
            </Row>

            <Row style={{ backgroundColor: '#eee' }}>
              <Col xs={4}><b>Category</b>:</Col>
              <Col xs={8}>{props.token.category}</Col>
            </Row>

            <Row>
              <Col xs={4}><b>Tags</b>:</Col>
              <Col xs={8}>{tags}</Col>
            </Row>

            <Row style={{ backgroundColor: '#eee' }}>
              <Col xs={4}><b>NFT Type</b>:</Col>
              <Col xs={8}>{props.token.nftType}</Col>
            </Row>

            <Row style={{ wordBreak: 'break-all' }}>
              <Col xs={4}><b>URL</b>:</Col>
              <Col xs={8}>{url}</Col>
            </Row>

            <Row style={{ backgroundColor: '#eee' }}>
              <Col xs={4}><b>NSFW</b>:</Col>
              <Col xs={8}>{nsfw.toString()}</Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    </>
  )
}

export default InfoButton
