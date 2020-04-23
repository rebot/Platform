import React, { useState, useEffect } from 'react'
import './App.css'

const openSocket = () => {
  return new Promise((resolve, reject) => {
    // Open the socket
    const socket = new WebSocket(`ws://${window.location.host}`)
    // Register an event listener when the Socket is opened
    socket.onopen = () => {
      resolve(socket)
    }
    // Register an event listener when an Error occurs
    socket.onerror = err => {
      console.log('No connection...')
      reject(err)
    }
  })
}

const Input = () => {
  const [input, setInput] = useState('Hallo wereld')

  const sendMessage = async () => {
    const socket = await openSocket()
    // Register an event listerer
    socket.onmessage = e => {
      console.log(e.data)
    }
    // Send the message
    socket.send(input)
    // Reset the input
    setInput('')
  }

  return (
    <div className='input-group'>
      <input type='text' className='form-control' value={input} onChange={e => setInput(e.target.value)} />
      <div className='input-group-append'>
        <button id='test' className='btn btn-dark' type='button' onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

const DropArea = ({ name, accept = ['*'] }) => {
  useEffect(() => {
    const dropArea = document.getElementById(name)
    // Invert the colours on dragover
    dropArea.ondragover = e => {
      e.preventDefault()
      dropArea.classList.add('text-white', 'bg-dark')
    }
    // Change the color back on leave
    dropArea.ondragleave = e => {
      dropArea.classList.remove('text-white', 'bg-dark')
    }
    // Process the event on a drop
    dropArea.ondrop = async e => {
      e.preventDefault()
      dropArea.classList.remove('text-white', 'bg-dark')
      for (const file of e.dataTransfer.files) {
        const [_, name, ext] = /^(.*?)\.([a-z]*$)/.exec(file.name)
        // Check if extension is accepted
        if (accept.includes('*') || accept.includes(ext)) {
          console.log(`CLIENT - Valid file : ${file.name}`)
          // Start a new socket
          const socket = await openSocket()
          // Register an event listerer
          socket.onmessage = e => {
            console.log(e.data)
          }
          // Send the message
          socket.send(file.name)
        } else {
          console.log(`CLIENT - Invalid file type : ${file.name}`)
        }
      }
    }
  }, [])

  return (
    <div id={name} className='card p-3 mb-3 w-100'>
      <blockquote className='blockquote'>
        <p className='mb-0'>Drop a <code>{accept.includes('*') ? 'any' : accept.join(',')}</code> file</p>
        <footer className='blockquote-footer'>
          <small className='text-muted'>
            <cite title='quote'>Drop it likes it hot</cite> by Snoop Dogg
          </small>
        </footer>
      </blockquote>
    </div>
  )
}

const App = () => {
  return (
    <div className='container-fluid p-5'>
      <div className='row'>
        <div className='col-lg-6'>
          <div className='display-4 pb-1'>
            Hello world <p className='lead'> From another <code> world </code>, how are you? </p>
          </div> <hr />
          <div className='container-fluid'>
            <div className='row pb-3'>
              <Input />
            </div>
            <div className='row pb-3'>
              <DropArea name='shd' accept={['shd']} />
              <DropArea name='pdf' accept={['pdf']} />
              <DropArea name='xml' accept={['xml']} />
            </div>
            <div className='row pb-3' />
          </div>
        </div>
        <div className='col-lg-6' />
      </div>
    </div>
  )
}

export default App
