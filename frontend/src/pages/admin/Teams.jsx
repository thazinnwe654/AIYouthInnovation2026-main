import { Fragment, useEffect, useState } from 'react'
import { listTeams, createTeam, addMember, listMembers, removeMember } from '../../api/teams'
import { listUsers } from '../../api/admin'
import { listCompetitions } from '../../api/competitions'
import { listAssignments, deleteAssignment } from '../../api/judges'
import { safeExternalUrl } from '../../utils'
import { Link } from 'react-router-dom'

export default function AdminTeams() {
  const [teams, setTeams] = useState([])
  const [comps, setComps] = useState([])
  const [users, setUsers] = useState([])
  const [assignments, setAssignments] = useState([])
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
    listAssignments().then(setAssignments).catch(() => {})
  }, [])

  // Judges assigned to each team, so the admin can see coverage at a glance.
  const judgesByTeam = {}
  assignments.forEach(a => {
    if (!judgesByTeam[a.team_id]) judgesByTeam[a.team_id] = []
    if (!judgesByTeam[a.team_id].some(x => x.judge_id === a.judge_id)) {
      judgesByTeam[a.team_id].push(a)
    }
  })
  const unassignedTeams = teams.filter(t => (judgesByTeam[t.id] || []).length === 0).length

  const loadAssignments = () => listAssignments().then(setAssignments).catch(() => {})

  const handleUnassign = async (assignment) => {
    const who = assignment.judge_email || `judge ${assignment.judge_id}`
    if (!confirm(
      `Remove ${who} from this team?\n\n` +
      `${who} will no longer be able to open this team's files or score it. ` +
      'Any scores they already gave are kept.'
    )) return
    setErr(''); setMsg('')
    try {
      const res = await deleteAssignment(assignment.id)
      setMsg(res?.detail || `Removed ${who}.`)
      loadAssignments()
      load()
    } catch (e) { setErr(e.response?.data?.detail || 'Could not remove the judge') }
  }

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

      {msg && <div className="bg-emerald-100 text-emerald-800 p-3 rounded mb-4 text-sm">{msg}</div>}
      {err && <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-sm">{err}</div>}

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Create New Team</h2>
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
        <div className="px-3 py-2 border-b bg-gray-50 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Teams</h2>
          <span className="text-sm text-slate-600">{teams.length} team(s)</span>
          {unassignedTeams > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              {unassignedTeams} with no judge assigned
            </span>
          )}
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Team Name</th>
              <th className="p-3">Project Name</th>
              <th className="p-3">Demo</th>
              <th className="p-3">Competition</th>
              <th className="p-3">Assigned judges</th>
              <th className="p-3">Members</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(t => {
              const assigned = judgesByTeam[t.id] || []
              return (
              <Fragment key={t.id}>
                <tr className={`border-t ${assigned.length === 0 ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                  <td className="p-3">{t.id}</td>
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3 text-sm text-indigo-600 font-medium">
                    {t.product_name || <span className="text-slate-400 font-normal">—</span>}
                  </td>
                  <td className="p-3 text-sm">
                    {safeExternalUrl(t.youtube_url) ? (
                      <a
                        href={safeExternalUrl(t.youtube_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-rose-600 underline decoration-rose-300 hover:text-rose-700"
                      >
                        Watch
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {comps.find(c => c.id === t.competition_id)?.name || t.competition_id}
                  </td>
                  <td className="p-3">
                    {assigned.length === 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        No judge assigned
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assigned.map(a => (
                          <span
                            key={a.judge_id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 py-0.5 pl-2 pr-0.5 text-xs font-semibold text-indigo-700"
                          >
                            <span>{a.judge_email || `Judge ${a.judge_id}`}</span>
                            {a.judge_role === 'HEAD_JUDGE' && (
                              <span className="rounded-full border border-violet-200 bg-violet-50 px-1.5 text-[10px] font-bold text-violet-700">
                                HEAD
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUnassign(a)}
                              className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-500 hover:text-white hover:ring-rose-500"
                              title={`Remove ${a.judge_email || 'this judge'} from this team`}
                              aria-label={`Remove ${a.judge_email || 'this judge'} from this team`}
                            >
                              Remove
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3">{t.members_count || 0}</td>
                  <td className="p-3 flex flex-wrap gap-3">
                    <Link to={`/teams/${t.id}`} className="text-indigo-600 hover:underline text-sm">View</Link>
                    <button onClick={() => toggleMembers(t)} className="text-indigo-600 hover:underline text-sm">
                      {openTeam === t.id ? 'Close members' : 'Manage members'}
                    </button>
                  </td>
                </tr>
                {openTeam === t.id && (
                  <tr className="border-t bg-slate-50">
                    <td colSpan="8" className="p-4">
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
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
