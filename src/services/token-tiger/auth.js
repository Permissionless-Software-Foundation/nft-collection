import axios from 'axios'

const sessionKey = 'TokenTigerUser'
const appModeKey = `${sessionKey}-mode`

const SERVER = process.env.REACT_APP_API_URL
// Detect if the app is running in a browser.
export const isBrowser = () => typeof window !== 'undefined'

// Get user data from localstorage
export const getUser = () =>
  isBrowser() && window.localStorage.getItem(sessionKey)
    ? JSON.parse(window.localStorage.getItem(sessionKey))
    : {}

export const getAppMode = () =>
  isBrowser() && window.localStorage.getItem(appModeKey)
    ? window.localStorage.getItem(appModeKey)
    : ''
export const setAppMode = mode =>
  window.localStorage.setItem(appModeKey, mode)

// Save user data to localstorage
export const setUser = user =>
  window.localStorage.setItem(sessionKey, JSON.stringify(user))

export const handleLogin = async ({ email, password }) => {
  // try auth
  try {
    const options = {
      method: 'POST',
      url: `${SERVER}/auth`,
      headers: {
        Accept: 'application/json'
      },
      data: {
        email,
        password
      }
    }
    const result = await axios(options)
    const response = result.data // await data.json()
    setUser({
      _id: response.user._id,
      username: response.user.username,
      jwt: response.token,
      projects: response.user.projects,
      email: response.user.email
    })
    return true
  } catch (e) {
    console.warn('Error in auth/handleLogin()', e.message)
    throw e
  }
}

// Return true if user is logged in. Otherwise false.
export const isLoggedIn = () => {
  const user = getUser()

  return !!user.email
}

export const logout = callback => {
  setUser({})
  if (callback) {
    callback()
  }
}

export const getExpirationDate = async () => {
  const token = getUser().jwt ? getUser().jwt : ''
  try {
    const options = {
      method: 'GET',
      url: `${SERVER}/auth/expiration`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`

      }
    }
    const result = await axios(options)
    const response = result.data // await data.json()
    if (response.user && response.token) {
      setUser(response)
    }
    return response
  } catch (e) {
    console.warn('Error in auth/getExpirationDate()', e.message)
    throw e
  }
}

export const verifyTokenExpiration = async () => {
  try {
    const result = await getExpirationDate()

    // If the expiration data are not found returns -1
    // indicating that should redirect to login
    if (!result || !result.now || !result.exp) {
      return -1
    }

    // Dates in ISO format, example --> '2020-10-22T23:27:11.000Z'
    // Testing purposes
    // const now = new Date('2020-10-23T21:27:11.000')
    // const exp = new Date('2020-10-23T22:26:11.000Z')

    const now = new Date(result.now)
    const exp = new Date(result.exp)

    const dateDiff = exp.getTime() - now.getTime()
    const hourDiff = Math.floor(dateDiff / 1000 / 60 / 60)

    return hourDiff
  } catch (error) {
    return 0
  }
}
