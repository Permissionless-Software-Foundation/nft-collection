/*
  Global configuration settings for this app.
*/

const config = {
  // Default IPFS CID for the app. This will be overwritten by dynamic lookup.
  ipfsCid: 'bafybeic6d4kr23hrcxb4q75m27zeejbfdljbjzi4tkrhfog65iakqfsuci',

  // BCH address used to point to the latest version of the IPFS CID.
  appBchAddr: 'bitcoincash:qz0v5gfxeug6avjmv6shfr7wcurhxnaghq5lnshfrp',

  // Site mirrors
  fullstackUrl: 'https://nft-collector.fullstack.cash',
  ghPagesUrl: 'https://permissionless-software-foundation.github.io/nft-collection/',
  apkUrl: 'https://github.com/Permissionless-Software-Foundation/nft-collection/raw/master/apk/nft-collector.apk',

  // Backup Info that goes into the Footer.
  ghRepo: 'https://github.com/Permissionless-Software-Foundation/nft-collection',
  radicleUrl: 'https://app.radicle.network/seeds/willow.radicle.garden/rad:git:hnrkbu9q9bxk7yy67ygi4k6apw9qdrbz5wfoy/remotes/hyyycncbn9qzqmobnhjq9rry6t4mbjiadzjoyhaknzxjcz3cxkpfpc',
  filecoinRepo: 'https://bafybeihwlrzjrhvwy4sqjjcnvfvkw42fvh7ry76ppa5hi6l7jhzp4m5bhe.ipfs.w3s.link/'
}

export default config
