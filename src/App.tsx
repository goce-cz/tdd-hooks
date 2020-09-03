import React from 'react'
import './App.css'
import { AsciiCheckbox } from './AsciiCheckbox'
import { AutoSaveInput } from './AutoSaveInput'
import { BusyProvider } from './hooks/use-busy'
import { BusySignal } from './BusySignal'

function App () {
  return (
    <BusyProvider>
      <BusySignal>
        <div><AsciiCheckbox/></div>
        <div><AutoSaveInput/></div>
      </BusySignal>
    </BusyProvider>
  )
}

export default App;
