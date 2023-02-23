import React, { useState } from 'react'

import { Formik } from 'formik'
import * as EmailValidator from 'email-validator'

import loginFormStyles from './styles/loginForm.module.scss'
import { handleLogin } from '../../services/token-tiger/auth'
import { createUser } from '../../services/token-tiger/users'
import { toast } from 'react-toastify'
import PropagateLoader from 'react-spinners/PropagateLoader'

const LoginForm = ({ callback }) => {
  const [loading, setLoading] = useState(false)

  const submit = (values, { setSubmitting }) => {
    setTimeout(async () => {
      try {
        setSubmitting(true)

        setLoading(true)
        if (!values.isCreateBtn) {
          await handleLogin(values)
        } else {
          await createUser(values)
        }

        setTimeout(() => {
          toast.success('Login Success!')
          setLoading(false)
          callback()
        }, 1000)
      } catch (error) {
        values.isCreateBtn = false
        setSubmitting(false)
        setTimeout(() => {
          setLoading(false)
          toast.error(error.message)
        }, 1000)
      }
    }, 500)
  }
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      onSubmit={submit}
      validate={(values) => {
        const errors = {}
        if (!values.email) {
          errors.email = 'Required'
        } else if (!EmailValidator.validate(values.email)) {
          errors.email = 'Invalid email address.'
        }

        if (!values.password) {
          errors.password = 'Required'
        }
        return errors
      }}
    >
      {(props) => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit
        } = props
        return (
          <div className={loginFormStyles.container}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
              <label htmlFor='email'>Email</label>
              <input
                id='email'
                name='email'
                type='text'
                placeholder='Enter your email'
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email && touched.email && 'error'}
              />
              {errors.email && touched.email && (
                <div className={loginFormStyles.inputFeedback}>
                  {errors.email}
                </div>
              )}

              <label htmlFor='password'>Password</label>
              <input
                id='password'
                name='password'
                type='password'
                placeholder='Enter your password'
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password && touched.password && 'error'}
              />
              {errors.password && touched.password && (
                <div className={loginFormStyles.inputFeedback}>
                  {errors.password}
                </div>
              )}
              <PropagateLoader
                color='#ffffff'
                loading={loading}
                size={5}
                cssOverride={{ display: 'block', textAlign: 'center', marginBottom: '2.5em' }}
                speedMultiplier={1}
              />
              <div className={loginFormStyles.btnContainer}>
                <button type='submit' disabled={isSubmitting} onFocus={() => { values.isCreateBtn = true }}>
                  Create
                </button>
                <button type='submit' disabled={isSubmitting} onClick={() => { values.isCreateBtn = false }}>
                  Login
                </button>
              </div>
            </form>
            <p className={loginFormStyles.copyright}>
              &copy; Copyright {new Date().getFullYear()} All rights
              reserved.
            </p>
          </div>
        )
      }}
    </Formik>
  )
}

export default LoginForm
