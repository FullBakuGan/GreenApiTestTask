import { StyleProvider } from '@ant-design/cssinjs'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import store from '@/store'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <StyleProvider layer>
        <App />
        <Toaster position="top-center" />
      </StyleProvider>
    </Provider>
  </StrictMode>,
)
