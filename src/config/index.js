/*
  Global configuration settings for this app.
*/

const config = {
  // Default IPFS CID for the app. This will be overwritten by dynamic lookup.
  ipfsCid: 'bafybeibya4cwro6rgqfaazqxckcchy6qo5sz2aqc4dx7ptcvpns5peqcz4',

  // BCH address used to point to the latest version of the IPFS CID.
  appBchAddr: 'bitcoincash:qz0v5gfxeug6avjmv6shfr7wcurhxnaghq5lnshfrp',

  // Site mirrors
  fullstackUrl: 'https://nft-collector.fullstack.cash',
  ghPagesUrl: 'https://permissionless-software-foundation.github.io/nft-collection/',
  apkUrl: 'https://github.com/Permissionless-Software-Foundation/nft-collection/raw/master/apk/nft-collector.apk',

  // Backup Info that goes into the Footer.
  ghRepo: 'https://github.com/Permissionless-Software-Foundation/react-bootstrap-web3-spa',
  radicleUrl: 'https://app.radicle.network/seeds/maple.radicle.garden/rad:git:hnrkd5cjwwb5tzx37hq9uqm5ubon7ee468xcy/remotes/hyyycncbn9qzqmobnhjq9rry6t4mbjiadzjoyhaknzxjcz3cxkpfpc'
}

export default config
