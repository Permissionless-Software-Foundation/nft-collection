
import axios from 'axios'
import { setUser, getUser } from './auth'
const SERVER = process.env.REACT_APP_API_URL

export const createUser = async ({ email, password }) => {
  // try auth
  try {
    const options = {
      method: 'POST',
      url: `${SERVER}/users`,
      headers: {
        Accept: 'application/json'
      },
      data: {
        user: {
          email,
          password,
          ignoreEmailCheck: true
        }

      }
    }
    const result = await axios(options)
    const response = result.data // await data.json()
    setUser({
      _id: response.user._id,
      email: response.user.email,
      jwt: response.token
    })
    return true
  } catch (e) {
    console.warn('Error in user/createUser()', e.message)
    throw e
  }
}

// Reset user password
export const resetPassword = async email => {
  try {
    const options = {
      method: 'GET',
      url: `${SERVER}/users/resetpassword/${email}`,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const resp = await axios(options)
    return resp.data
  } catch (e) {
    return false
  }
}

export const updateUser = async user => {
  try {
    const token = getUser().jwt ? getUser().jwt : ''

    const options = {
      method: 'PUT',
      url: `${SERVER}/users/${user._id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      data: {
        user
      }
    }
    const result = await axios(options)

    const response = result.data
    setUser({
      _id: response.user._id,
      email: response.user.email,
      jwt: token
    })
    return response
  } catch (err) {
    console.log('error in user/updateUser')
    throw err
  }
}

export const getSharableCollectionData = async ({ userId, publicId }) => {
  const token = getUser().jwt ? getUser().jwt : ''

  try {
    const options = {
      method: 'GET',
      url: `${SERVER}/users/share/nft/${userId}/${publicId}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }

    }
    const result = await axios(options)
    const response = result.data // await data.json()
    return response
  } catch (e) {
    console.warn('Error in user/createUser()', e.message)
    throw e
  }
}
