import { Outlet } from 'react-router-dom'
import ResponsableNavbar from './ResponsableNavbar'
import './ResponsableLayout.css'

export default function ResponsableLayout() {
    return (
        <div className="responsable-layout">
            <ResponsableNavbar />
            <main className="responsable-main">
                <Outlet />
            </main>
        </div>
    )
}
