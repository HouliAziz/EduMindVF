import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import '../../index.css'

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
