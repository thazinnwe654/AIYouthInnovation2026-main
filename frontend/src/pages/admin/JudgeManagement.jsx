import { useEffect, useState } from 'react'
import {
  createJudge,
  listJudges,
  createAssignment,
  createBulkAssignments,
  listAssignments,
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
  const [viewAssignmentsFor, setViewAssignmentsFor] = useState('')
  const [assignments, setAssignments] = useState([])
  const [critName, setCritName] = useState('')
  const [critWeight, setCritWeight] = useState('')

  const loadJudges = () => listJudges().then(setJudges).catch(() => {})

  useEffect(() => {
    listUsers().then(setUsers).catch(() => {})
    listTeams().then(setTeams).catch(() => {})
    listCompetitions().then(setComps).catch(() => {})
    listCriteria().then(setCriteria).catch(() => {})
    loadJudges()
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
      await createAssignment(parseInt(assignJudgeId), parseInt(assignTeamId), parseInt(assignCompId))
      setMsg('Assignment created.')
      loadJudges()
    } catch (e) { setErr(e.response?.data?.detail || 'Error') }
  }

  const handleBulkAssign = async () => {
    setErr(''); setMsg('')
    try {
      const res = await createBulkAssignments(parseInt(assignJudgeId), parseInt(bulkCompId))
      setMsg(`Assigned ${res.created} team(s) of ${res.total_teams}. The judge can now open files and score those teams.`)
      loadJudges()
    } catch (e) { setErr(e.response?.data?.detail || 'Error') }
  }

  const handleShowAssignments = async (judgeId) => {
    setErr('')
    if (viewAssignmentsFor === String(judgeId)) { setViewAssignmentsFor(''); setAssignments([]); return }
    setViewAssignmentsFor(String(judgeId))
    try { setAssignments(await listAssignments(judgeId)) }
    catch (e) { setErr(e.response?.data?.detail || 'Could not load assignments') }
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
                    onClick={() => handleShowAssignments(j.id)}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    {viewAssignmentsFor === String(j.id) ? 'Hide' : 'View'}
                  </button>
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
          {viewAssignmentsFor && (
            <div className="mt-2 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700 mb-1">
                {assignments.length} assignment(s)
              </p>
              <p className="text-xs text-slate-600">
                {assignments.map(a => `Team ${a.team_id}`).join(', ') || 'None'}
              </p>
            </div>
          )}
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
            <select value={assignTeamId} onChange={e => setAssignTeamId(e.target.value)} className="w-full border p-3 rounded">
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
