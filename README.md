# nft-collection

This is a simple web app for showing off your collection of NFTs.

This is a React single page app (SPA). Given a `bitcoincash` address, this app will display any NFTs held by that address which comply with [PS007](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps007-token-data-schema.md) spec for token data.

- [Live App](https://nft-collector.fullstack.cash/)
- [GitHub pages](https://permissionless-software-foundation.github.io/nft-collection/)
- [Android APK](https://github.com/Permissionless-Software-Foundation/nft-collection/raw/master/apk/nft-collector.apk)
- [Filecoin](https://bafybeic6d4kr23hrcxb4q75m27zeejbfdljbjzi4tkrhfog65iakqfsuci.ipfs.dweb.link/)

## Installation
```bash
git clone https://github.com/Permissionless-Software-Foundation/nft-collection
cd nft-collection
npm install
npm start
npm run build
```

## Publish to Filecoin
```bash
export FILECOIN_TOKEN=myFilecoinAPITokenFromWeb3.Storage
npm run build
npm run pub
```

Learn more about alternative deployments in the [deployment directory](./deploy)

## Support

Have questions? Need help? Join our community support
[Telegram channel](https://t.me/bch_js_toolkit)

## Donate

This open source software is developed and maintained by the [Permissionless Software Foundation](https://psfoundation.cash). If this library provides value to you, please consider making a donation to support the PSF developers:

<div align="center">
<img src="./img/donation-qr.png" />
<p>bitcoincash:qqsrke9lh257tqen99dkyy2emh4uty0vky9y0z0lsr</p>
</div>

## Repo Backup
This GitHub repository is backed up on [Radicle](https://radicle.network/get-started.html). If GitHub ever censors this respository, the code can be found in this alternative repository. [Here are extra notes on working with Radicle](https://christroutner.github.io/trouts-blog/docs/censorship/radicle).

- Project ID: rad:git:hnrkd5cjwwb5tzx37hq9uqm5ubon7ee468xcy
- [Repo on Rad Website](https://app.radicle.network/seeds/maple.radicle.garden/rad:git:hnrkd5cjwwb5tzx37hq9uqm5ubon7ee468xcy/remotes/hyyycncbn9qzqmobnhjq9rry6t4mbjiadzjoyhaknzxjcz3cxkpfpc)

This can be cloned from [PSF](https://psfoundation.info) Radicle seed node with one of these commands:
- `rad clone rad:git:hnrkd5cjwwb5tzx37hq9uqm5ubon7ee468xcy --seed radicle.fullstackcash.nl`
- `rad clone rad:git:hnrkd5cjwwb5tzx37hq9uqm5ubon7ee468xcy --seed maple.radicle.garden`

## License
[MIT](./LICENSE.md)
