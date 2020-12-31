import './index.css'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

const Container = ({children}) => {
  return (
    <div
      style={{
        background: '#111',
        minHeight: '100vh',
        height: '100%',
        color: 'white',
      }}
    >
      {children}
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Container>
      <App />
    </Container>
  </React.StrictMode>,
  document.getElementById('root')
)
