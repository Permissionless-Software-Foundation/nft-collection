import React, { useState, useEffect } from 'react'

import loginInfoStyles from './styles/loginInfo.module.scss'

import t1 from './assets/t1.png'
import t2 from './assets/t2.png'
import t3 from './assets/t3.png'
import t4 from './assets/t4.png'
import t5 from './assets/t5.png'

export default function LoginInfo () {
  const [imageIndex, setImageIndex] = useState(null)
  const imageArray = [t1, t2, t3, t4, t5]

  useEffect(() => {
    setImageIndex(Math.floor(Math.random() * imageArray.length))
    // eslint-disable-next-line
  }, []);

  return (
    <div className={loginInfoStyles.container}>
      <div className={loginInfoStyles.imgContainer}>
        <img
          className={loginInfoStyles.tiger}
          src={imageArray[imageIndex]}
          alt='Random tiger'
        />
      </div>
      <h2>
        Create your own <br /> NFT tokens
      </h2>
      <p>
        NFT creator running on the bitcoincash blockchain powered by the PSF and
        Launchpadip.com
      </p>
    </div>
  )
}
