import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCompetition, getLeaderboard } from '../api/competitions'
import { useAuth } from '../context/AuthContext'

export function CompetitionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isTeamMember = user?.role === 'TEAM_MEMBER' || user?.role === 'TEAM_LEADER'
  const [comp, setComp] = useState(null)
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('score')

  useEffect(() => {
    setLoading(true)
    setError('')
    getCompetition(id)
      .then(setComp)
      .catch(err => setError(err.response?.data?.detail || 'Failed to load competition'))
    if (!isTeamMember) {
      getLeaderboard(id)
        .then(setBoard)
        .catch(err => setError(err.response?.data?.detail || 'Failed to load scores'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [id])

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Link to="/competitions" className="text-base font-medium text-indigo-600 hover:underline">&larr; Back</Link>
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
          {error}
        </div>
      </div>
    )
  }

  if (!comp) return <div className="p-6 text-lg text-slate-600">Loading...</div>

  const myTotal = board.reduce((sum, b) => sum + (b.total_score || 0), 0)
  const myScoredTeams = board.filter(b => (b.num_scores || 0) > 0).length

  const rows = board.slice().sort((a, b) => {
    if (sortBy === 'name') return String(a.team_name || '').localeCompare(String(b.team_name || ''))
    if (sortBy === 'team') return a.team_id - b.team_id
    if (b.total_score !== a.total_score) return b.total_score - a.total_score
    return a.team_id - b.team_id
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/competitions" className="text-base font-medium text-indigo-600 hover:underline">&larr; Back</Link>
      <h1 className="text-4xl font-bold mt-4 mb-2">{comp.name}</h1>
      <p className="text-lg text-slate-600 mb-6">{comp.category}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-indigo-600">{comp.teams_count}</p>
          <p className="text-base text-slate-600">Teams</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-green-600">{comp.deliverables_count}</p>
          <p className="text-base text-slate-600">Deliverables</p>
        </div>
        <Link to={`/competitions/${id}/deliverables`} className="bg-white p-5 rounded-xl shadow text-center hover:bg-indigo-50">
          <p className="text-lg text-indigo-600 font-semibold">Manage Deliverables &rarr;</p>
        </Link>
        <Link to={`/competitions/${id}/teams`} className="bg-white p-5 rounded-xl shadow text-center hover:bg-indigo-50">
          <p className="text-lg text-indigo-600 font-semibold">View Teams &rarr;</p>
        </Link>
      </div>

      {!isTeamMember && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base font-medium text-slate-600">Your scores in this competition</p>
              <p className="text-2xl font-bold text-slate-900">
                {myTotal} points across {myScoredTeams} of {board.length} team(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="board-sort" className="text-base font-medium text-slate-700">Sort</label>
              <select
                id="board-sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-indigo-400 focus:outline-none"
              >
                <option value="score">Highest score</option>
                <option value="name">Team name (A-Z)</option>
                <option value="team">Team ID</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {!isTeamMember && loading && <p className="text-lg text-slate-600">Loading your scores...</p>}

      {!isTeamMember && !loading && board.length === 0 && (
        <p className="text-lg text-slate-600">No teams in this competition yet.</p>
      )}

      {!isTeamMember && !loading && board.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-base font-semibold text-slate-700">Rank</th>
                <th className="p-4 text-base font-semibold text-slate-700">Team</th>
                <th className="p-4 text-base font-semibold text-slate-700">Your total</th>
                <th className="p-4 text-base font-semibold text-slate-700">Criteria you scored</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(b => (
                <tr key={b.team_id} className="border-t hover:bg-slate-50">
                  <td className="p-4 text-lg font-bold text-indigo-600">{b.rank}</td>
                  <td className="p-4">
                    <Link to={`/teams/${b.team_id}`} className="text-lg font-semibold text-slate-900 hover:text-indigo-700">
                      {b.team_name || `Team ${b.team_id}`}
                    </Link>
                    <span className="block text-sm text-slate-500">ID: {b.team_id}</span>
                  </td>
                  <td className="p-4 text-xl font-bold text-slate-900">{(b.total_score || 0).toFixed(1)}</td>
                  <td className="p-4 text-base text-slate-700">
                    {b.num_scores || 0}
                    {!b.num_scores && <span className="ml-1 text-sm text-slate-400">not scored</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            These totals include only the scores you submitted.
          </div>
        </div>
      )}
    </div>
  )
}
