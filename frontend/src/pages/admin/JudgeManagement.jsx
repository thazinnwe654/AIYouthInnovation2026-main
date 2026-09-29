import { useEffect, useState } from 'react'
import {
  createJudge,
  listJudges,
  createAssignment,
  createBulkAssignments,
  listAssignments,
  deleteAssignment,
  listCriteria,
  createCriterion,
} from '../../api/judges'
import { listUsers } from '../../api/admin'
import { listTeams } from '../../api/teams'
import { listCompetitions } from '../../api/competitions'

export default function JudgeManagement() {
  const [users, setUsers] = useState([])
  const [judges, setJudges] = useState([])
  const [teams, setTeams] = useState([])
  const [comps, setComps] = useState([])
  const [criteria, setCriteria] = useState([])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const [judgeUserId, setJudgeUserId] = useState('')
  const [assignJudgeId, setAssignJudgeId] = useState('')
  const [assignTeamId, setAssignTeamId] = useState('')
  const [assignCompId, setAssignCompId] = useState('')
  const [bulkCompId, setBulkCompId] = useState('')
  const [assignments, setAssignments] = useState([])
  const [teamSearch, setTeamSearch] = useState('')
  const [unassignedOnly, setUnassignedOnly] = useState(false)
  const [critName, setCritName] = useState('')
  const [critWeight, setCritWeight] = useState('')

  const loadJudges = () => listJudges().then(setJudges).catch(() => {})

  // Every assignment, not filtered by judge: this is what builds the team table.
  const loadAllAssignments = () => listAssignments().then(setAssignments).catch(() => {})

  useEffect(() => {
    listUsers().then(setUsers).catch(() => {})
    listTeams().then(setTeams).catch(() => {})
    listCompetitions().then(setComps).catch(() => {})
    listCriteria().then(setCriteria).catch(() => {})
    loadJudges()
    loadAllAssignments()
  }, [])

  const judgeUsers = users.filter(u => ['JUDGE', 'HEAD_JUDGE'].includes(u.role))
  const judgeUserIds = new Set(judges.map(j => j.user_id))
  const judgeUsersWithoutProfile = judgeUsers.filter(u => !judgeUserIds.has(u.id))

  const handleCreateJudge = async () => {
    setErr(''); setMsg('')
    try {
      await createJudge(parseInt(judgeUserId))
      setMsg('Judge profile created. The account can now use View Files and Score Teams.')
      setJudgeUserId('')
      loadJudges()
    } catch (e) { setErr(e.response?.data?.detail || 'Error') }
  }

  const handleAssign = async () => {
    setErr(''); setMsg('')
    try {
      const res = await createAssignment(parseInt(assignJudgeId), parseInt(assignTeamId), parseInt(assignCompId))
      setMsg(res?.created === false
        ? `${res.detail} Nothing to change.`
        : `${res?.detail || 'Assignment created.'} The judge can now open files and score that team.`)
      loadJudges()
      loadAllAssignments()
    } catch (e) { setErr(e.response?.data?.detail || 'Error') }
  }

  const handleBulkAssign = async () => {
    setErr(''); setMsg('')
    try {
      const res = await createBulkAssignments(parseInt(assignJudgeId), parseInt(bulkCompId))
      setMsg(`Assigned ${res.created} team(s) of ${res.total_teams}. The judge can now open files and score those teams.`)
      loadJudges()
      loadAllAssignments()
    } catch (e) { setErr(e.response?.data?.detail || 'Error') }
  }

  const handleUnassign = async (assignment, teamRow) => {
    const who = assignment.judge_email || `judge ${assignment.judge_id}`
    if (!confirm(
      `Remove ${who} from ${teamRow?.name || 'this team'}?\n\n` +
      `${who} will no longer be able to open that team's files or score it. ` +
      'Any scores they already gave are kept.'
    )) return
    setErr(''); setMsg('')
    try {
      const res = await deleteAssignment(assignment.id)
      setMsg(res?.detail || `Removed ${who}.`)
      loadJudges()
      loadAllAssignments()
    } catch (e) { setErr(e.response?.data?.detail || 'Could not remove the judge') }
  }

  const handleCreateCriterion = async () => {
    setErr(''); setMsg('')
    try {
      await createCriterion(critName, parseFloat(critWeight))
      setCritName(''); setCritWeight('')
      setMsg('Criterion created.')
      listCriteria().then(setCriteria)
    } catch (e) { setErr(e.response?.data?.detail || 'Error') }
  }

  // One row per team, with every judge assigned to it. Teams nobody has been
  // given are kept in the list so the gaps are visible, and can be filtered.
  const judgesByTeam = {}
  assignments.forEach(a => {
    if (!judgesByTeam[a.team_id]) judgesByTeam[a.team_id] = []
    if (!judgesByTeam[a.team_id].some(x => x.judge_id === a.judge_id)) {
      judgesByTeam[a.team_id].push(a)
    }
  })

  const teamRows = teams
    .map(t => ({
      id: t.id,
      name: t.name,
      productName: t.product_name,
      competitionId: t.competition_id,
      competitionName: comps.find(c => c.id === t.competition_id)?.name || t.competition_id,
      assigned: judgesByTeam[t.id] || [],
    }))
    .filter(row => {
      if (unassignedOnly && row.assigned.length > 0) return false
      if (!teamSearch) return true
      const q = teamSearch.toLowerCase()
      return (
        String(row.id) === teamSearch ||
        String(row.name || '').toLowerCase().includes(q) ||
        String(row.productName || '').toLowerCase().includes(q) ||
        row.assigned.some(a => String(a.judge_email || '').toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      if (a.assigned.length === 0 !== (b.assigned.length === 0)) {
        return a.assigned.length === 0 ? 1 : -1
      }
      return String(a.name || '').localeCompare(String(b.name || ''))
    })

  const unassignedCount = teams.filter(t => (judgesByTeam[t.id] || []).length === 0).length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Judge Management</h1>
      <p className="text-slate-600 mb-6">
        Give a new judge the same access as the other judges: create their judge profile, then assign them teams.
        Without team assignments a judge sees no files and cannot score.
      </p>
      {msg && <div className="bg-emerald-100 text-emerald-800 p-3 rounded mb-4 text-sm">{msg}</div>}
      {err && <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-sm">{err}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-1">1. Judge accounts</h2>
          <p className="text-sm text-slate-600 mb-4">
            A judge needs a judge profile before View Files and Score Teams work.
          </p>
          {judgeUsersWithoutProfile.length === 0 ? (
            <p className="text-sm text-emerald-700">Every judge account already has a profile.</p>
          ) : (
            <>
              <select value={judgeUserId} onChange={e => setJudgeUserId(e.target.value)} className="w-full border p-3 rounded mb-3">
                <option value="">Select judge account</option>
                {judgeUsersWithoutProfile.map(u => <option key={u.id} value={u.id}>{u.email} ({u.role})</option>)}
              </select>
              <button
                onClick={handleCreateJudge}
                disabled={!judgeUserId}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full disabled:opacity-50"
              >
                Create judge profile
              </button>
            </>
          )}

          <h3 className="text-sm font-semibold text-slate-700 mt-6 mb-2">Existing judges</h3>
          <ul className="space-y-1">
            {judges.map(j => (
              <li key={j.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-800">
                  {j.email} <span className="text-xs text-slate-500">({j.role})</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {j.assignment_count} team(s)
                  </span>
                  <button
                    onClick={() => setAssignJudgeId(String(j.id))}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Select
                  </button>
                </span>
              </li>
            ))}
            {judges.length === 0 && <li className="text-sm text-slate-500">No judge profiles yet.</li>}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-1">2. Assign teams</h2>
          <p className="text-sm text-slate-600 mb-4">Pick a judge, then give them every team of a competition in one click.</p>
          <label className="block text-sm font-medium text-slate-700 mb-1">Judge</label>
          <select value={assignJudgeId} onChange={e => setAssignJudgeId(e.target.value)} className="w-full border p-3 rounded mb-3">
            <option value="">Select judge</option>
            {judges.map(j => <option key={j.id} value={j.id}>{j.email} ({j.assignment_count} team(s))</option>)}
          </select>

          <label className="block text-sm font-medium text-slate-700 mb-1">Competition (assign all teams)</label>
          <select value={bulkCompId} onChange={e => setBulkCompId(e.target.value)} className="w-full border p-3 rounded mb-3">
            <option value="">Select competition</option>
            {comps.map(c => <option key={c.id} value={c.id}>{c.name} ({c.category})</option>)}
          </select>
          <button
            onClick={handleBulkAssign}
            disabled={!assignJudgeId || !bulkCompId}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full disabled:opacity-50 mb-6"
          >
            Assign all teams in this competition
          </button>

          <p className="text-sm font-semibold text-slate-700 mb-2">Or assign a single team</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={assignTeamId}
              onChange={e => {
                const id = e.target.value
                setAssignTeamId(id)
                // Default the competition to the one the team belongs to, so the
                // two cannot disagree and trip the backend's consistency check.
                const team = teams.find(t => String(t.id) === id)
                if (team) setAssignCompId(String(team.competition_id))
              }}
              className="w-full border p-3 rounded"
            >
              <option value="">Select Team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={assignCompId} onChange={e => setAssignCompId(e.target.value)} className="w-full border p-3 rounded">
              <option value="">Select Competition</option>
              {comps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button
            onClick={handleAssign}
            disabled={!assignJudgeId || !assignTeamId || !assignCompId}
            className="mt-3 bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800 w-full disabled:opacity-50"
          >
            Assign this team only
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">3. Teams and their judges</h2>
            <p className="text-sm text-slate-600">
              Every team with the judges assigned to it.
              {unassignedCount > 0 && ` ${unassignedCount} team(s) have no judge yet.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Search team, project or judge"
              value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
              className="w-64 border p-2 rounded text-sm"
            />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={unassignedOnly} onChange={e => setUnassignedOnly(e.target.checked)} />
              No judge yet ({unassignedCount})
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">Team Name</th>
                <th className="p-2">Project Name</th>
                <th className="p-2">Competition</th>
                <th className="p-2">Assigned judges</th>
              </tr>
            </thead>
            <tbody>
              {teamRows.map(row => (
                <tr key={row.id} className={`border-t ${row.assigned.length === 0 ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                  <td className="p-2">
                    <span className="font-medium text-slate-800">{row.name}</span>
                    <span className="ml-2 text-xs text-slate-400">#{row.id}</span>
                  </td>
                  <td className="p-2 text-indigo-600 font-medium">
                    {row.productName || <span className="text-slate-400 font-normal">—</span>}
                  </td>
                  <td className="p-2 text-slate-600">{row.competitionName}</td>
                  <td className="p-2">
                    {row.assigned.length === 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        No judge assigned
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {row.assigned.map(a => (
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
                              onClick={() => handleUnassign(a, row)}
                              className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-500 hover:text-white hover:ring-rose-500"
                              title={`Remove ${a.judge_email || 'this judge'} from ${row.name}`}
                              aria-label={`Remove ${a.judge_email || 'this judge'} from ${row.name}`}
                            >
                              Remove
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {teamRows.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-500">
                    {teams.length === 0 ? 'No teams yet.' : 'No team matches the current search or filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Evaluation Criteria</h2>
        <div className="flex gap-4 mb-4">
          <input type="text" placeholder="Criterion Name" value={critName} onChange={e => setCritName(e.target.value)} className="flex-1 border p-3 rounded" />
          <input type="number" step="0.1" placeholder="Weight" value={critWeight} onChange={e => setCritWeight(e.target.value)} className="w-24 border p-3 rounded" />
          <button onClick={handleCreateCriterion} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50"><tr><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Weight</th></tr></thead>
          <tbody>{criteria.map(c => (
            <tr key={c.id} className="border-t"><td className="p-2">{c.id}</td><td className="p-2">{c.name}</td><td className="p-2">{c.weight}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
