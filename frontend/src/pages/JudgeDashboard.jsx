import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  getCompetitionSubmissions,
  downloadFile,
  downloadTeamZip,
} from '../api/deliverables'
import {
  listMyAssignments,
  getCriteria,
  createMyEvaluation,
  addScore,
  clearEvaluation,
  getCompetitionScores,
  listMyEvaluations,
  getJudgeAllSubmissions,
} from '../api/judges'
import { getFileIcon, formatFileSize } from '../utils'

const statusStyles = {
  OPEN: 'bg-slate-100 text-slate-700 border border-slate-200',
  SUBMITTED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  READY: 'bg-green-100 text-green-700 border border-green-200',
  LOCKED: 'bg-amber-100 text-amber-700 border border-amber-200',
  FINALIZED: 'bg-violet-100 text-violet-700 border border-violet-200',
  NEED_REVISION: 'bg-rose-100 text-rose-700 border border-rose-200',
}

export default function JudgeDashboard() {
  const navigate = useNavigate()
  const urlComp = new URLSearchParams(window.location.search).get('comp') || 'all'
  const [compId] = useState(urlComp)
  const isAll = compId === 'all'
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [criteria, setCriteria] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('files')
  const [searchTeam, setSearchTeam] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [localScores, setLocalScores] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [assignData, critData] = await Promise.all([
        listMyAssignments(),
        getCriteria(),
      ])
      let subData, evalData, scoreData
      if (isAll) {
        subData = await getJudgeAllSubmissions()
        evalData = await listMyEvaluations()
        scoreData = []
      } else {
        [subData, evalData, scoreData] = await Promise.all([
          getCompetitionSubmissions(compId),
          listMyEvaluations(compId),
          getCompetitionScores(compId),
        ])
      }
      setAssignments(assignData)
      setSubmissions(subData)
      setCriteria(critData)
      setEvaluations(evalData)
      setScores(scoreData)
      const initScores = {}
      for (const ev of evalData) {
        for (const sc of (ev.scores || [])) {
          const key = sc.criterion_id ? `${ev.team_id}-${sc.criterion_id}` : `${ev.team_id}-${sc.criterion}`
          initScores[key] = sc.score
        }
      }
      setLocalScores(initScores)
      if (isAll && evalData.length > 0) {
        const computedScores = {}
        for (const ev of evalData) {
          const tid = String(ev.team_id)
          if (!computedScores[tid]) {
            computedScores[tid] = { team_id: ev.team_id, total_score: 0, criteria_scores: {}, num_judges: 1, max_possible: 0 }
          }
          const cs = computedScores[tid]
          for (const sc of (ev.scores || [])) {
            if (sc.criterion) {
              if (!cs.criteria_scores[sc.criterion]) cs.criteria_scores[sc.criterion] = { score: 0 }
              cs.criteria_scores[sc.criterion].score = sc.score
              cs.total_score += sc.score
            }
          }
        }
        setScores(Object.values(computedScores))
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getEvaluationForTeam = (teamId) => {
    return evaluations.find(e => e.team_id === parseInt(teamId))
  }

  const getScoreForTeam = (teamId) => {
    return scores.find(s => s.team_id === parseInt(teamId))
  }

  const downloadTeamArchive = async (teamId, category = null) => {
    try {
      await downloadTeamZip(teamId, category)
    } catch (err) {
      setError(err.message || 'Could not download team files')
    }
  }

  const handleScoreSubmit = async (teamId, criterionId, score, comment) => {
    try {
      let evaluation = getEvaluationForTeam(teamId)
      if (!evaluation) {
        const teamSubmission = submissions.find(s => s.team_id === parseInt(teamId))
        const teamCompId = teamSubmission?.competition_id || (isAll ? parseInt(teamSubmission?.competition_id) || 1 : compId)
        const evalResult = await createMyEvaluation(teamId, teamCompId)
        evaluation = { id: evalResult.id, team_id: teamId, scores: [] }
        setEvaluations(prev => [...prev, evaluation])
      }
      await addScore(evaluation.id, criterionId, score, comment)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit score')
    }
  }

  const handleClearEvaluation = async (evaluation) => {
    if (!evaluation || !window.confirm('Clear this evaluation and all saved scores for this team?')) return
    try {
      await clearEvaluation(evaluation.id)
      await loadData()
    } catch (err) {
      if (err.response?.status === 404) {
        await loadData()
        return
      }
      setError(err.response?.data?.detail || 'Failed to clear evaluation')
    }
  }

  if (loading) return <div className="p-6 text-slate-600">Loading dashboard...</div>
  if (error) return <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-xl mx-auto max-w-4xl">{error}</div>

  const teams = {}
  submissions.forEach(sub => {
    if (!teams[sub.team_id]) {
      teams[sub.team_id] = { name: sub.team_name, submissions: [] }
    }
    teams[sub.team_id].submissions.push(sub)
  })
  const teamList = Object.entries(teams)
  const filteredTeams = searchTeam
    ? teamList.filter(([teamId, team]) =>
        String(teamId) === String(searchTeam) ||
        team.name.toLowerCase().includes(searchTeam.toLowerCase())
      )
    : teamList

  const categories = [...new Set(submissions.map(sub => sub.deliverable_category).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b)))
  const visibleSubmissions = (team) => categoryFilter === 'all'
    ? team.submissions
    : team.submissions.filter(sub => sub.deliverable_category === categoryFilter)

  const summaryCards = [
    { label: 'Assigned teams', value: assignments.length || teamList.length, tone: 'indigo' },
    { label: 'Files to review', value: submissions.reduce((sum, sub) => sum + (sub.files?.length || 0), 0), tone: 'sky' },
    { label: 'Evaluations', value: evaluations.length, tone: 'emerald' },
    { label: 'Criteria', value: criteria.length, tone: 'amber' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Judge workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Judge Dashboard</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('files')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === 'files'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            View Files
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === 'scores'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Score Teams
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
          >
            Back
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(card => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              card.tone === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
              card.tone === 'sky' ? 'bg-sky-100 text-sky-700' :
              card.tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              'bg-amber-100 text-amber-700'}
            `}>
              {card.label}
            </div>
            <div className="text-3xl font-bold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Current view</p>
            <p className="text-lg font-semibold text-slate-800">
              {isAll ? 'All assigned competitions' : `Competition ${compId}`}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {isAll ? (
              <Link to="/judge-dashboard?comp=1" className="font-medium text-indigo-600 hover:text-indigo-700">View Competition 1</Link>
            ) : (
              <Link to="/judge-dashboard?comp=all" className="font-medium text-indigo-600 hover:text-indigo-700">View all teams</Link>
            )}
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              {assignments.length} teams assigned
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'files' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">File filters</p>
                <h2 className="text-lg font-bold text-slate-900">Browse submissions by category</h2>
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Category
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="min-w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus:border-indigo-400 focus:outline-none"
                >
                  <option value="all">All categories</option>
                  {categories.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            </div>
          </div>
          {teamList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No submissions found.
            </div>
          ) : (
            teamList.map(([teamId, team]) => (
              <div key={teamId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Team</p>
                    <h2 className="text-xl font-bold text-slate-900">
                      {isAll && team.submissions[0]?.competition_name ? `${team.submissions[0].competition_name} · ` : ''}
                      {team.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>Team ID: {teamId}</span>
                    <button
                      onClick={() => downloadTeamArchive(teamId, categoryFilter === 'all' ? null : categoryFilter)}
                      className="rounded-lg bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-700"
                      disabled={!visibleSubmissions(team).some(sub => sub.files?.length)}
                    >
                      Download visible files
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {visibleSubmissions(team).length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">No submissions in this category.</p>
                  ) : [...new Set(visibleSubmissions(team).map(sub => sub.deliverable_category || 'Uncategorized'))].map(category => {
                    const categorySubmissions = visibleSubmissions(team).filter(sub => (sub.deliverable_category || 'Uncategorized') === category)
                    return (
                    <section key={category} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-slate-800">{category}</h3>
                        <button
                          onClick={() => downloadTeamArchive(teamId, category === 'Uncategorized' ? null : category)}
                          className="self-start rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!categorySubmissions.some(sub => sub.files?.length)}
                        >
                          Download category ({categorySubmissions.reduce((total, sub) => total + (sub.files?.length || 0), 0)})
                        </button>
                      </div>
                      <div className="space-y-3">
                      {categorySubmissions.map(sub => (
                    <div key={sub.submission_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-semibold text-slate-800">{sub.deliverable_name}</h3>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[sub.status] || 'bg-slate-100 text-slate-700'}`}>
                            {sub.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Updated: {new Date(sub.updated_at).toLocaleString()}
                        </span>
                      </div>

                      {sub.files && sub.files.length > 0 ? (
                        <div className="space-y-2">
                          {sub.files.map(f => (
                            <div key={f.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-xl">{getFileIcon(f.original_filename)}</div>
                                <div>
                                  <div className="font-medium text-slate-800">{f.original_filename}</div>
                                  <div className="text-xs text-slate-500">{formatFileSize(f.file_size)}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadFile(sub.submission_id, f.id, f.original_filename).catch(err => setError(err.message))}
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400">No files uploaded yet</p>
                      )}
                    </div>
                      ))}
                      </div>
                    </section>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'scores' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Team scoring</p>
                <h2 className="text-xl font-bold text-slate-900">Evaluate assigned submissions</h2>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Search</label>
                <input
                  type="text"
                  placeholder="Team ID or name"
                  value={searchTeam}
                  onChange={e => setSearchTeam(e.target.value)}
                  className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
                {searchTeam && (
                  <button onClick={() => setSearchTeam('')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {teamList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No teams to score.
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No team found with "{searchTeam}".
            </div>
          ) : (
            filteredTeams.map(([teamId, team]) => {
              const scoreData = getScoreForTeam(teamId)
              const evaluation = getEvaluationForTeam(teamId)
              return (
                <div key={teamId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Team score</p>
                      <h2 className="text-xl font-bold text-slate-900">{team.name}</h2>
                    </div>
                    {scoreData && (
                      <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                        Total: {scoreData.total_score}/{scoreData.max_possible}
                      </div>
                    )}
                  </div>

                  {evaluation && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">Evaluation ID: {evaluation.id}</p>
                      <button
                        type="button"
                        onClick={() => handleClearEvaluation(evaluation)}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        disabled={evaluation.status === 'LOCKED' || evaluation.status === 'FINALIZED'}
                        title={evaluation.status === 'LOCKED' || evaluation.status === 'FINALIZED'
                          ? 'Locked or finalized evaluations cannot be cleared'
                          : 'Remove this evaluation and all saved scores'}
                      >
                        Clear evaluation and scores
                      </button>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {criteria.map(c => {
                      const existing = evaluation?.scores?.find(s => s.criterion === c.name)?.score
                      const localKey = `${teamId}-${c.id}`
                      const displayValue = localScores[localKey] !== undefined ? localScores[localKey] : (existing !== undefined ? existing : '')
                      return (
                        <div key={c.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-800">{c.name}</label>
                            <span className="text-xs text-slate-500">Max {c.weight}</span>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max={c.weight}
                            step="1"
                            value={displayValue}
                            onChange={e => setLocalScores(prev => ({ ...prev, [localKey]: parseInt(e.target.value) || '' }))}
                            onBlur={e => {
                              const val = parseInt(e.target.value) || ''
                              if (val !== '' && val >= 1 && val <= c.weight) {
                                handleScoreSubmit(teamId, c.id, val, '')
                              }
                            }}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                          />
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span>1</span>
                            <span>{c.weight}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
