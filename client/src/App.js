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

const DropArea = ({ accept = ['*'] }) => {
  useEffect(() => {
    const dropArea = document.getElementById('drop-area')
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
    dropArea.ondrop = e => {
      e.preventDefault()
      for (const file of e.dataTransfer.files) {
        const [_, name, ext] = /^(.*?)\.([a-z]*$)/.exec(file.name)
        // Check if extension is accepted
        if (accept.includes('*') || accept.includes(ext)) {
          console.log(`"${ext}" extension is allowed`)
        }

      }
    }
  }, [])

  return (
    <div id='drop-area' className='card p-3 w-100'>
      <blockquote className='blockquote'>
        <p className='mb-0'>Drop a <code>.shd</code> file</p>
        <footer className='blockquote-footer'>
          <small className='text-muted'>
            Drop it likes it hot by <cite title='Source Title'>Snoop Dogg</cite>
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
              <DropArea accept={['png', 'gpx', 'py']}/>
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
