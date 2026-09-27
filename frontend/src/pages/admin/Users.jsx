import { useEffect, useState } from 'react'
import { listUsers, createUser } from '../../api/admin'
import { resetPassword } from '../../api/auth'

const ROLES = ['TEAM_MEMBER', 'TEAM_LEADER', 'JUDGE', 'HEAD_JUDGE', 'LECTURER', 'ADMIN']

const ROLE_LABELS = {
  TEAM_MEMBER: 'Team member (uploads files)',
  TEAM_LEADER: 'Team leader (uploads files)',
  JUDGE: 'Judge (views files, scores teams)',
  HEAD_JUDGE: 'Head judge (locks and corrects scores)',
  LECTURER: 'Lecturer (read only)',
  ADMIN: 'Administrator (full access)',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('TEAM_MEMBER')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [resetTarget, setResetTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetErr, setResetErr] = useState('')

  const load = () => listUsers().then(setUsers).catch(() => {})
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    if (password.length < 6) { setErr('Password must be at least 6 characters'); return }
    try {
      await createUser(email, password, role)
      setEmail('')
      setPassword('')
      setMsg(`User created.${role === 'JUDGE' || role === 'HEAD_JUDGE' ? ' Judge profile created - now assign teams in Judge Management.' : ''}`)
      load()
    } catch (e2) { setErr(e2.response?.data?.detail || 'Error') }
  }

  const openReset = (u) => {
    setResetTarget(u)
    setNewPassword('')
    setResetMsg('')
    setResetErr('')
  }

  const closeReset = () => {
    setResetTarget(null)
    setNewPassword('')
    setResetMsg('')
    setResetErr('')
  }

  const submitReset = async (e) => {
    e.preventDefault()
    setResetErr(''); setResetMsg('')
    if (newPassword.length < 6) { setResetErr('New password must be at least 6 characters'); return }
    try {
      await resetPassword(resetTarget.id, newPassword)
      setResetMsg(`Password reset for ${resetTarget.email}. Share the new password with them securely.`)
    } catch (e2) {
      const d = e2.response?.data?.detail
      setResetErr(typeof d === 'string' ? d : 'Reset failed')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New User</h2>
        {msg && <div className="bg-emerald-100 text-emerald-800 p-3 rounded mb-3 text-sm">{msg}</div>}
        {err && <div className="bg-red-100 text-red-800 p-3 rounded mb-3 text-sm">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-3 rounded" required />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} className="border p-3 rounded" required />
          <select value={role} onChange={e => setRole(e.target.value)} className="border p-3 rounded">
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          {role === 'JUDGE' || role === 'HEAD_JUDGE'
            ? 'A judge profile is created automatically. Assign teams afterwards in Judge Management so the judge can open files.'
            : 'Team accounts must be added to a team in Manage Teams before they can upload files.'}
        </p>
        <button type="submit" className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Create</button>
      </form>

      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={submitReset} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-1">Reset password</h2>
            <p className="text-sm text-gray-600 mb-4">{resetTarget.email} ({resetTarget.role})</p>
            {resetMsg && <div className="bg-emerald-100 text-emerald-800 p-3 rounded mb-3 text-sm">{resetMsg}</div>}
            {resetErr && <div className="bg-red-100 text-red-800 p-3 rounded mb-3 text-sm">{resetErr}</div>}
            <label className="block text-sm font-medium mb-1" htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="text"
              placeholder="Type the new password (min 6 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border p-3 rounded mb-1"
              autoFocus
            />
            <p className="text-xs text-gray-500 mb-4">Write it down before closing: it cannot be shown again.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeReset} className="bg-gray-200 px-4 py-2 rounded text-sm">Cancel</button>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50" disabled={!newPassword}>
                Reset password
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
         <thead className="bg-gray-50"><tr><th className="p-3">ID</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Actions</th></tr></thead>
         <tbody>{users.map(u => (
           <tr key={u.id} className="border-t hover:bg-gray-50">
             <td className="p-3">{u.id}</td>
             <td className="p-3">{u.email}</td>
             <td className="p-3"><span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">{u.role}</span></td>
              <td className="p-3">
                <button
                  onClick={() => openReset(u)}
                  className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded"
                >
                  Reset PW
                </button>
              </td>
           </tr>
         ))}</tbody>
        </table>
      </div>
    </div>
  )
}
