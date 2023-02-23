/*
*/

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'

import 'react-toastify/dist/ReactToastify.css'
import 'react-tippy/dist/tippy.css'
import { ToastContainer } from 'react-toastify'
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom'
// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

ReactDOM.render(
  <>

    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>

        <Routes>
          <Route path='/users/share/nft/' element={<App />} />

        </Routes>

        <ToastContainer
          position='top-right'
          autoClose={1500}
          hideProgressBar
          newestOnTop={false}
          rtl={false}
          theme='colored'
        />

      </QueryParamProvider>
    </BrowserRouter>

  </>
  , document.getElementById('root'))

// Updating to React v18
// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
