import { Outlet } from 'react-router-dom'
import FormateurNavbar from './FormateurNavbar'
import './FormateurLayout.css'

export default function FormateurLayout() {
    return (
        <div className="formateur-layout">
            <FormateurNavbar />
            <main className="formateur-main">
                <Outlet />
            </main>
        </div>
    )
}
