/*
  This library ensures the demo address does not display any unplanned tokens.
*/

const DEMO_ADDRESS = 'bitcoincash:qzsgnyd826c6xw5y3y4ct6q2gvf3r8fmkqfvtzn6ef'

class DemoFilter {
  // This function is used to filter the tokens array for only the tokens that
  // should be in the demo address.
  filterDemoTokens (addr, tokens) {
    // console.log(`addr: ${addr}`)

    // If the address does not match the demo address, then return the input.
    if (addr !== DEMO_ADDRESS) {
      // console.log('returning tokens input')
      return tokens
    }

    const tokenList = [
      '0de866f9fda1e667f20540a6c660a86b71cc57982b5be232459c44899c437ffc',
      'e4abea2449df948096666e4999cae8debdd7b263a961221b23584285de3752c2',
      'acb6b93958d9192cc7254aeb7d79782754a8224abc2909829e3ea147b26a7cd1',
      'debfd52548bb601b49107d3526368aafc02d81de2d5886049539083b62698447',
      'bee3814cd2c78d977114c4707586a7671d15e332293f05b8e38b01df2cf3cbc6',
      '6b79dcd813e7882e15a6f13eaaddbe0b6a97b9a5fcb43ab24bf3e316bd9f941d',
      'c4db5733b3f92e3333d55c957609b08cfde236a3c313ad402088e344d674ded6',
      '042ed677f8d5773d592946d9370244cc884b10191e9e8bbfb02e9bdfd3f40396',
      'e11a6cb24cc82cfdca6a2701237d661de331ac168641dedefa8643fd9527114c',
      '279b7581bd1aacedc92711aa58992e4c33eed187d59a3a6cc3ded519cf19a6a5',
      '36ad67bb2e9d866172da4e37568fad19a68a1ae179c466cc3bcbfa74ccb5dd38',
      '285dadc0138a6c4e7023b962e400d82d49b60ebe4151af68ae79015af8f39a81',
      '29a8b1cf687348dd060eba64defe02a187285aa26ecb9d2e21c9e99ad8e2e88e',
      '3353b7b6c586cdcf3c6b017c0320c8be3afde734dd72d91c07857aaf60a39216',
      '076e8238973ed0acbc10c9f71e6127bcbfbcdba97bdb63b3d42af5e84c91a6ef'
    ]

    const tokensOut = tokens.filter(x => {
      return tokenList.includes(x.tokenId)
    })

    return tokensOut
  }
}

export default DemoFilter
