import React from 'react'

import LoginForm from '../components/token-tiger/loginForm'
import LoginInfo from '../components/token-tiger/loginInfo'

// import logo from '../components/assets/logo.png'
import loginStyles from './styles/login.module.scss'

export default function Login (props) {
  return (
    <div className={loginStyles.container}>
      <div className={loginStyles.login}>
        <h1 className={loginStyles.logoText}>
          TokenTiger <span className={loginStyles.tm}>&trade;</span>{' '}
        </h1>
        <LoginForm {...props} />
      </div>
      <div className={loginStyles.info}>
        <LoginInfo />
      </div>
    </div>
  )
}
