import React from 'react'
import { AppContext } from '../../context'
import { useContext } from 'react'

export default function Contact({contact}) {
  const {setReceiver} = useContext(AppContext)
  
  return (
    <div className='Contact' onClick={() => setReceiver(contact)}> {contact.id}</div>
  )
}
