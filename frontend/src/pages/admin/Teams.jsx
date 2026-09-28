import { Fragment, useEffect, useState } from 'react'
import { listTeams, createTeam, deleteTeam, addMember, listMembers, removeMember } from '../../api/teams'
import { listUsers } from '../../api/admin'
import { listCompetitions } from '../../api/competitions'
import { Link } from 'react-router-dom'

export default function AdminTeams() {
  const [teams, setTeams] = useState([])
  const [comps, setComps] = useState([])
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [productName, setProductName] = useState('')
  const [compId, setCompId] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [openTeam, setOpenTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [memberEmail, setMemberEmail] = useState('')
  const [asLeader, setAsLeader] = useState(false)

  const load = () => listTeams().then(setTeams).catch(() => {})
  useEffect(() => {
    load()
    listCompetitions().then(setComps).catch(() => {})
    listUsers().then(setUsers).catch(() => {})
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      await createTeam({ name, competition_id: parseInt(compId), product_name: productName.trim() || null })
      setName('')
      setProductName('')
      setMsg('Team created! Now add the member accounts below so they can upload files.')
      load()
    } catch (e2) { setErr(e2.response?.data?.detail || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this team?')) return
    try { await deleteTeam(id); load() } catch (e2) { setErr(e2.response?.data?.detail || 'Error') }
  }

  const toggleMembers = async (team) => {
    if (openTeam === team.id) { setOpenTeam(null); setMembers([]); return }
    setErr(''); setMsg('')
    setOpenTeam(team.id)
    setMemberEmail('')
    try { setMembers(await listMembers(team.id)) }
    catch (e2) { setErr(e2.response?.data?.detail || 'Could not load members') }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    const user = users.find(u => u.email.toLowerCase() === memberEmail.trim().toLowerCase())
    if (!user) { setErr(`No user account found with email "${memberEmail}". Create the account in Manage Users first.`); return }
    if (!['TEAM_MEMBER', 'TEAM_LEADER', 'ADMIN'].includes(user.role)) {
      setErr(`${user.email} has role ${user.role}. Only team accounts can be added as members.`)
      return
    }
    try {
      await addMember(openTeam, user.id, asLeader || user.role === 'TEAM_LEADER')
      setMsg(`Added ${user.email} to the team.`)
      setMemberEmail('')
      setMembers(await listMembers(openTeam))
      load()
    } catch (e2) { setErr(e2.response?.data?.detail || 'Could not add member') }
  }

  const handleRemoveMember = async (userId, email) => {
    if (!confirm(`Remove ${email} from this team?`)) return
    setErr(''); setMsg('')
    try {
      await removeMember(openTeam, userId)
      setMsg(`Removed ${email}.`)
      setMembers(await listMembers(openTeam))
      load()
    } catch (e2) { setErr(e2.response?.data?.detail || 'Could not remove member') }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Manage Teams</h1>
      <p className="text-slate-600 mb-6">
        Create a team, then attach the member accounts so they can upload files. A team account that is not
        attached to a team sees "You are not a member of any team" when opening My Uploads.
      </p>

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Create New Team</h2>
        {msg && <div className="bg-emerald-100 text-emerald-800 p-3 rounded mb-3 text-sm">{msg}</div>}
        {err && <div className="bg-red-100 text-red-800 p-3 rounded mb-3 text-sm">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Team Name" value={name} onChange={e => setName(e.target.value)} className="border p-3 rounded" required />
          <input type="text" placeholder="Project Name (optional)" value={productName} onChange={e => setProductName(e.target.value)} className="border p-3 rounded" />
          <select value={compId} onChange={e => setCompId(e.target.value)} className="border p-3 rounded" required>
            <option value="">Select Competition</option>
            {comps.map(c => <option key={c.id} value={c.id}>{c.name} ({c.category})</option>)}
          </select>
        </div>
        <button type="submit" className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Create Team</button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Team Name</th>
              <th className="p-3">Project Name</th>
              <th className="p-3">Competition</th>
              <th className="p-3">Members</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(t => (
              <Fragment key={t.id}>
                <tr className="border-t hover:bg-gray-50">
                  <td className="p-3">{t.id}</td>
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3 text-sm text-indigo-600 font-medium">
                    {t.product_name || <span className="text-slate-400 font-normal">—</span>}
                  </td>
                  <td className="p-3 text-sm">
                    {comps.find(c => c.id === t.competition_id)?.name || t.competition_id}
                  </td>
                  <td className="p-3">{t.members_count || 0}</td>
                  <td className="p-3 flex flex-wrap gap-3">
                    <Link to={`/teams/${t.id}`} className="text-indigo-600 hover:underline text-sm">View</Link>
                    <button onClick={() => toggleMembers(t)} className="text-indigo-600 hover:underline text-sm">
                      {openTeam === t.id ? 'Close members' : 'Manage members'}
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
                {openTeam === t.id && (
                  <tr className="border-t bg-slate-50">
                    <td colSpan="6" className="p-4">
                      <h3 className="font-semibold text-slate-800 mb-3">Members of {t.name}</h3>
                      {members.length === 0 ? (
                        <p className="text-sm text-slate-600 mb-3">
                          No members yet. Add a team account below so they can upload files.
                        </p>
                      ) : (
                        <ul className="space-y-1 mb-4">
                          {members.map(m => (
                            <li key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <span className="text-sm text-slate-800">
                                {m.email}
                                {m.is_leader && <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">Leader</span>}
                              </span>
                              <button
                                onClick={() => handleRemoveMember(m.user_id, m.email)}
                                className="text-sm text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <form onSubmit={handleAddMember} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <label className="flex-1 flex flex-col gap-1 text-sm font-medium text-slate-700">
                          Member account email
                          <input
                            type="email"
                            list="team-user-emails"
                            placeholder="team.member@sti.edu.mm"
                            value={memberEmail}
                            onChange={e => setMemberEmail(e.target.value)}
                            className="border p-3 rounded"
                            required
                          />
                        </label>
                        <label className="flex items-center gap-2 pb-3 text-sm font-medium text-slate-700">
                          <input type="checkbox" checked={asLeader} onChange={e => setAsLeader(e.target.checked)} />
                          Team leader
                        </label>
                        <button type="submit" className="bg-indigo-600 text-white px-5 py-3 rounded hover:bg-indigo-700">
                          Add member
                        </button>
                      </form>
                      <datalist id="team-user-emails">
                        {users.filter(u => ['TEAM_MEMBER', 'TEAM_LEADER'].includes(u.role)).map(u => (
                          <option key={u.id} value={u.email} />
                        ))}
                      </datalist>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
