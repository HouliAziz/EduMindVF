import { Outlet } from 'react-router-dom'
import ParticipantNavbar from './ParticipantNavbar'
import './ParticipantLayout.css'

export default function ParticipantLayout() {
  return (
    <div className="participant-layout">
      <ParticipantNavbar />
      <main className="participant-main">
        <Outlet />
      </main>
    </div>
  )
}
