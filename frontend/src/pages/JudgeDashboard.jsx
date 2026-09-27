import { Fragment, useEffect, useRef, useState } from 'react'
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
  getSubmittedTeams,
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

const scoreFilters = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'Not finished' },
  { key: 'done', label: 'Completed' },
  { key: 'mine', label: 'Assigned to me' },
]

const sortOptions = [
  { key: 'todo', label: 'Unscored first' },
  { key: 'name', label: 'Team name (A-Z)' },
  { key: 'files', label: 'Most files' },
]

const criterionTones = [
  { chip: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', left: 'border-l-indigo-500' },
  { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', left: 'border-l-emerald-500' },
  { chip: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', left: 'border-l-amber-500' },
  { chip: 'bg-sky-100 text-sky-700 border-sky-200', dot: 'bg-sky-500', left: 'border-l-sky-500' },
  { chip: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', left: 'border-l-rose-500' },
  { chip: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500', left: 'border-l-violet-500' },
]

const quickScores = [
  { label: 'Low', pct: 0.5 },
  { label: 'Good', pct: 0.75 },
  { label: 'Top', pct: 1 },
]

export default function JudgeDashboard() {
  const navigate = useNavigate()
  const urlComp = new URLSearchParams(window.location.search).get('comp') || 'all'
  const [compId] = useState(urlComp)
  const isAll = compId === 'all'
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [submittedTeams, setSubmittedTeams] = useState([])
  const [criteria, setCriteria] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('files')
  const [searchTeam, setSearchTeam] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [fileCategory, setFileCategory] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [sortBy, setSortBy] = useState('todo')
  const [showEmptySubmissions, setShowEmptySubmissions] = useState(false)
  const [scoreCategory, setScoreCategory] = useState('all')
  const [localScores, setLocalScores] = useState({})
  const [notes, setNotes] = useState({})
  const [showNotes, setShowNotes] = useState({})
  const [scoreErrors, setScoreErrors] = useState({})
  const [scoreStatus, setScoreStatus] = useState({})
  const [collapsed, setCollapsed] = useState({})
  const [showGuide, setShowGuide] = useState(true)
  const scoreInputs = useRef({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [assignData, critData, teamData] = await Promise.all([
        listMyAssignments(),
        getCriteria(),
        getSubmittedTeams(isAll ? null : parseInt(compId, 10)),
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
      setSubmittedTeams(teamData)
      setCriteria(critData)
      setEvaluations(evalData)
      setScores(scoreData)
      const initScores = {}
      const initNotes = {}
      for (const ev of evalData) {
        for (const sc of (ev.scores || [])) {
          const key = sc.criterion_id ? `${ev.team_id}-${sc.criterion_id}` : `${ev.team_id}-${sc.criterion}`
          initScores[key] = sc.score
          if (sc.comment) initNotes[key] = sc.comment
        }
      }
      setLocalScores(initScores)
      setNotes(initNotes)
      if (isAll && evalData.length > 0) {
        setScores(computeMyScores(evalData))
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const computeMyScores = (evalData) => {
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
    return Object.values(computedScores)
  }

  const refreshScoresQuietly = async () => {
    try {
      const evalData = isAll ? await listMyEvaluations() : await listMyEvaluations(compId)
      setEvaluations(evalData)
      if (isAll) {
        setScores(evalData.length > 0 ? computeMyScores(evalData) : [])
      } else {
        const scoreData = await getCompetitionScores(compId)
        setScores(scoreData)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to refresh scores')
    }
  }

  const getEvaluationForTeam = (teamId) => {
    return evaluations.find(e => e.team_id === parseInt(teamId))
  }

  const getScoreForTeam = (teamId) => {
    return scores.find(s => s.team_id === parseInt(teamId))
  }

  const filesForTeam = (teamId, category = null) => {
    const teamSubs = submissions.filter(s => s.team_id === parseInt(teamId))
    const scoped = category ? teamSubs.filter(s => s.deliverable_category === category) : teamSubs
    return scoped.reduce((n, s) => n + (s.files?.length || 0), 0)
  }

  const teamNameFor = (teamId) => {
    const entry = Object.entries(teams).find(([id]) => String(id) === String(teamId))
    return entry ? entry[1].name : `Team ${teamId}`
  }

  const downloadTeamArchive = async (teamId, category = null) => {
    const available = filesForTeam(teamId, category)
    if (available === 0) {
      setError(
        category
          ? `${teamNameFor(teamId)} has no files in "${category}". Pick another deliverable category or ask the team to upload files.`
          : `${teamNameFor(teamId)} has not uploaded any files yet, so there is nothing to download.`
      )
      return
    }
    try {
      await downloadTeamZip(teamId, category)
    } catch (err) {
      const msg = String(err.message || '')
      if (msg.toLowerCase().includes('no files found')) {
        setError(
          category
            ? `${teamNameFor(teamId)} has no downloadable files in "${category}".`
            : `${teamNameFor(teamId)} has no downloadable files.`
        )
        return
      }
      setError(msg || 'Could not download team files')
    }
  }

  const handleScoreSubmit = async (teamId, criterionId, score, comment, localKey) => {
    if (localKey) setScoreStatus(prev => ({ ...prev, [localKey]: 'saving' }))
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
      setLocalScores(prev => ({ ...prev, [`${teamId}-${criterionId}`]: score }))
      if (localKey) {
        setScoreStatus(prev => ({ ...prev, [localKey]: 'saved' }))
        setTimeout(() => setScoreStatus(prev => ({ ...prev, [localKey]: '' })), 2500)
      }
      await refreshScoresQuietly()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit score'
      if (localKey) {
        setScoreErrors(prev => ({ ...prev, [localKey]: msg }))
        setScoreStatus(prev => ({ ...prev, [localKey]: '' }))
        const saved = getEvaluationForTeam(teamId)?.scores?.find(s => s.criterion_id === criterionId)?.score
        setLocalScores(prev => ({ ...prev, [`${teamId}-${criterionId}`]: saved !== undefined ? saved : '' }))
      } else {
        setError(msg)
      }
    }
  }

  const handleClearEvaluation = async (evaluation) => {
    if (!evaluation || !window.confirm('Clear this evaluation and all saved scores for this team?')) return
    try {
      await clearEvaluation(evaluation.id)
      setLocalScores(prev => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          if (key.startsWith(`${evaluation.team_id}-`)) delete next[key]
        }
        return next
      })
      setNotes({})
      await refreshScoresQuietly()
    } catch (err) {
      if (err.response?.status === 404) {
        await refreshScoresQuietly()
        return
      }
      setError(err.response?.data?.detail || 'Failed to clear evaluation')
    }
  }

  const applyScore = (teamId, criterion, localKey) => {
    const val = localScores[localKey]
    if (val === '' || val === undefined) return
    handleScoreSubmit(teamId, criterion.id, val, notes[localKey] || '', localKey)
  }

  const moveFocus = (teamId, criterion, direction) => {
    const idx = criteria.findIndex(c => c.id === criterion.id)
    const target = criteria[idx + direction]
    if (!target) return
    const el = scoreInputs.current[`${teamId}-${target.id}`]
    if (el) el.focus()
  }

  const focusTeam = (teamId, criterionIndex = 0) => {
    const criterion = criteria[criterionIndex]
    if (!criterion) return
    setCollapsed(prev => ({ ...prev, [`${teamId}`]: false }))
    const el = scoreInputs.current[`${teamId}-${criterion.id}`]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.focus()
    }
  }

  const renderCategoryHeader = (cat, catRows, catStat, tone) => {
    const catKey = `cat:${cat}`
    const catCollapsed = Boolean(collapsed[catKey])
    const catNext = catRows.find(x => x.isAssigned && !x.isComplete)
    return (
      <div className={`rounded-2xl border border-l-4 border-slate-200 bg-white px-5 py-4 shadow-sm ${tone.left}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 shrink-0 rounded-full ${tone.dot}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Category</p>
            </div>
            <h3 className="truncate text-xl font-bold text-slate-900">{cat}</h3>
            <p className="mt-1 text-base text-slate-600">
              {catRows.length} team(s) shown · {catRows.filter(x => x.isComplete).length} fully scored · {catRows.reduce((n, x) => n + (x.file_count || 0), 0)} file(s) to review
              {catStat ? ` · ${catStat.teams} team(s) submitted in total` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {catNext && (
              <button
                onClick={() => focusTeam(catNext.team_id)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Score next in this category
              </button>
            )}
            {catRows.length > 0 && (
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, [catKey]: !catCollapsed }))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                {catCollapsed ? `Show ${catRows.length} team(s)` : 'Collapse category'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div className="p-6 text-slate-600">Loading dashboard...</div>

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

  // Files tab grouping: competition category (AI for Engineering / Social / Entrepreneurship)
  const teamCategoryMap = {}
  submittedTeams.forEach(t => { teamCategoryMap[t.team_id] = t.competition_category })
  const categoryOfTeam = (teamId) => teamCategoryMap[teamId] || 'Uncategorized'
  const fileGroups = []
  filteredTeams.forEach(([teamId, team]) => {
    const cat = categoryOfTeam(teamId)
    let group = fileGroups.find(g => g.name === cat)
    if (!group) {
      group = { name: cat, rows: [], files: 0 }
      fileGroups.push(group)
    }
    const teamFileCount = team.submissions.reduce((n, s) => n + (s.files?.length || 0), 0)
    group.rows.push([teamId, team])
    group.files += teamFileCount
  })
  const fileGroupTones = {}
  fileGroups.forEach((g, i) => { fileGroupTones[g.name] = criterionTones[i % criterionTones.length] })
  const visibleFileGroups = fileCategory === 'all'
    ? fileGroups
    : fileGroups.filter(g => g.name === fileCategory)

  const deliverableStats = [...new Set(submissions.map(s => s.deliverable_category).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b)))
    .map(name => ({
      name,
      files: submissions
        .filter(s => s.deliverable_category === name)
        .reduce((n, s) => n + (s.files?.length || 0), 0),
    }))

  const maxScore = criteria.reduce((sum, c) => sum + c.weight, 0)

  const decorateTeam = (t) => {
    const teamSubs = submissions.filter(s => s.team_id === t.team_id)
    const evaluation = getEvaluationForTeam(t.team_id)
    const myScores = evaluation?.scores || []
    return {
      ...t,
      isAssigned: Boolean(t.is_assigned) || teamSubs.length > 0,
      evaluation,
      myTotal: myScores.reduce((sum, s) => sum + (s.score || 0), 0),
      scoredCount: myScores.length,
      teamSubs,
      isComplete: criteria.length > 0 && myScores.length >= criteria.length,
    }
  }

  const allRows = submittedTeams.map(decorateTeam)
  const realSubmitters = allRows.filter(t => t.has_files)
  const pendingRows = allRows.filter(t => !t.has_files)
  // Choosing an explicit sort order means the judge wants to see every submitted
  // team, otherwise there is nothing to sort (e.g. only one team has files).
  const sortingAllTeams = sortBy !== 'todo'
  const baseRows = (showEmptySubmissions || sortingAllTeams) ? allRows : realSubmitters

  const sortedRows = baseRows.slice().sort((a, b) => {
    if (sortBy === 'name') return String(a.team_name || '').localeCompare(String(b.team_name || ''))
    if (sortBy === 'files') return (b.file_count || 0) - (a.file_count || 0)
    if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1
    return String(a.team_name || '').localeCompare(String(b.team_name || ''))
  })

  let visibleScoreRows = sortedRows
  if (searchTeam) {
    visibleScoreRows = visibleScoreRows.filter(t =>
      String(t.team_id) === String(searchTeam) ||
      String(t.team_name || '').toLowerCase().includes(searchTeam.toLowerCase())
    )
  }
  if (scoreFilter === 'mine') visibleScoreRows = visibleScoreRows.filter(t => t.isAssigned)
  if (scoreFilter === 'todo') visibleScoreRows = visibleScoreRows.filter(t => t.isAssigned && !t.isComplete)
  if (scoreFilter === 'done') visibleScoreRows = visibleScoreRows.filter(t => t.isAssigned && t.isComplete)

  const categoryOf = (t) => t.competition_category || 'Uncategorized'
  const categoriesInView = [...new Set(allRows.map(categoryOf))].sort()
  if (scoreCategory !== 'all') {
    visibleScoreRows = visibleScoreRows.filter(t => categoryOf(t) === scoreCategory)
  }
  const categoryStats = categoriesInView.map(cat => {
    const rows = allRows.filter(t => categoryOf(t) === cat)
    return {
      name: cat,
      teams: rows.length,
      scored: rows.filter(t => t.isComplete).length,
      withFiles: rows.filter(t => t.has_files).length,
      files: rows.reduce((n, t) => n + (t.file_count || 0), 0),
    }
  })
  const categoryTones = {}
  categoriesInView.forEach((cat, i) => { categoryTones[cat] = criterionTones[i % criterionTones.length] })

  // Always render every competition category, even when it has no team with files,
  // so the judge can see the full picture instead of missing sections.
  const scoreSections = categoriesInView.map(name => ({
    name,
    rows: visibleScoreRows.filter(t => categoryOf(t) === name),
  })).sort((a, b) => {
    if (sortBy === 'files') {
      const fa = a.rows.reduce((n, t) => n + (t.file_count || 0), 0)
      const fb = b.rows.reduce((n, t) => n + (t.file_count || 0), 0)
      if (fa !== fb) return fb - fa
    }
    if (sortBy === 'todo') {
      const ua = a.rows.some(t => t.isAssigned && !t.isComplete) ? 0 : 1
      const ub = b.rows.some(t => t.isAssigned && !t.isComplete) ? 0 : 1
      if (ua !== ub) return ua - ub
    }
    return a.name.localeCompare(b.name)
  })
  const scoreRenderList = []
  scoreSections.forEach(section => {
    if (section.rows.length === 0) {
      scoreRenderList.push({ __emptyCategory: section.name })
    } else {
      section.rows.forEach(t => scoreRenderList.push(t))
    }
  })
  const hasActiveFilter = Boolean(searchTeam) || scoreFilter !== 'all' || scoreCategory !== 'all'

  const myAssignedCount = baseRows.filter(t => t.isAssigned).length
  const myCompletedCount = baseRows.filter(t => t.isAssigned && t.isComplete).length
  const myScoredPoints = baseRows.reduce((sum, t) => sum + t.myTotal, 0)
  const nextUnscored = sortedRows.find(t => t.isAssigned && !t.isComplete)
  const currentIndex = nextUnscored ? visibleScoreRows.findIndex(t => t.team_id === nextUnscored.team_id) : -1
  const prevTeam = currentIndex > 0 ? visibleScoreRows[currentIndex - 1] : null
  const nextTeam = currentIndex >= 0 && currentIndex < visibleScoreRows.length - 1 ? visibleScoreRows[currentIndex + 1] : null

  const categories = [...new Set(submissions.map(sub => sub.deliverable_category).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b)))
  const visibleSubmissions = (team) => categoryFilter === 'all'
    ? team.submissions
    : team.submissions.filter(sub => sub.deliverable_category === categoryFilter)

  const summaryCards = [
    { label: 'Teams with files', value: realSubmitters.length, tone: 'indigo' },
    { label: 'Your teams', value: myAssignedCount, tone: 'sky' },
    { label: 'Still to score', value: myAssignedCount - myCompletedCount, tone: 'emerald' },
    { label: 'Points you gave', value: myScoredPoints, tone: 'amber' },
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
            className={`flex-1 rounded-xl px-4 py-3 text-center text-base font-semibold transition sm:flex-none ${activeTab === 'files'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            View Files
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 rounded-xl px-4 py-3 text-center text-base font-semibold transition sm:flex-none ${activeTab === 'scores'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Score Teams
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-slate-200 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-300"
          >
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => loadData()} className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700">Retry</button>
            <button onClick={() => setError('')} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium hover:bg-red-100">Dismiss</button>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(card => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              card.tone === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
              card.tone === 'sky' ? 'bg-sky-100 text-sky-700' :
              card.tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              'bg-amber-100 text-amber-700'}
            `}>
              {card.label}
            </div>
            <div className="text-4xl font-bold text-slate-900">{card.value}</div>
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
            <span className="text-slate-600">{realSubmitters.length} team(s) uploaded files</span>
          </div>
        </div>
      </div>

      {activeTab === 'files' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">File filters</p>
                <h2 className="text-xl font-bold text-slate-900">Browse submissions by category</h2>
                <p className="mt-1 text-base text-slate-600">
                  Teams are grouped by category. Use the filters below to focus on one category or one deliverable type.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label htmlFor="file-comp-category" className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Competition category
                  <select
                    id="file-comp-category"
                    value={fileCategory}
                    onChange={e => setFileCategory(e.target.value)}
                    className="min-w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-normal focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="all">All categories</option>
                    {fileGroups.map(g => (
                      <option key={g.name} value={g.name}>{g.name} ({g.rows.length} team(s), {g.files} file(s))</option>
                    ))}
                  </select>
                </label>
                <label htmlFor="file-category" className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Deliverable category
                  <select
                    id="file-category"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="min-w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-normal focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="all">All deliverable types</option>
                    {deliverableStats.map(d => (
                      <option key={d.name} value={d.name}>{d.name} ({d.files} file(s))</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              {fileGroups.map((g, i) => {
                const tone = fileGroupTones[g.name] || criterionTones[0]
                const active = fileCategory === g.name
                return (
                  <button
                    key={g.name}
                    onClick={() => setFileCategory(active ? 'all' : g.name)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-white' : tone.dot}`} />
                    {g.name}
                    <span className={active ? 'text-indigo-100' : 'text-slate-500'}>({g.rows.length})</span>
                  </button>
                )
              })}
              {fileCategory !== 'all' && (
                <button onClick={() => setFileCategory('all')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  Clear filter
                </button>
              )}
              <span className="ml-auto text-sm text-slate-500">
                {teamList.length} team(s) · {submissions.reduce((n, s) => n + (s.files?.length || 0), 0)} file(s) total
              </span>
            </div>
          </div>
          {teamList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
              <p className="text-lg font-semibold text-amber-900">No files to show yet</p>
              <p className="mt-1 text-base text-amber-800">
                {assignments.length === 0
                  ? 'You have not been assigned any team yet, so there are no files to open. Ask an admin to assign you teams in Admin -> Judge Management, and they will appear here.'
                  : 'None of your assigned teams has uploaded a file yet.'}
              </p>
            </div>
          ) : (
            visibleFileGroups.map(group => {
              const tone = fileGroupTones[group.name] || criterionTones[0]
              const groupKey = `files:${group.name}`
              const groupCollapsed = Boolean(collapsed[groupKey])
              return (
                <Fragment key={group.name}>
                  <div className={`rounded-2xl border border-l-4 border-slate-200 bg-white px-5 py-4 shadow-sm ${tone.left}`}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 shrink-0 rounded-full ${tone.dot}`} />
                          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Category</p>
                        </div>
                        <h2 className="truncate text-xl font-bold text-slate-900">{group.name}</h2>
                        <p className="mt-1 text-base text-slate-600">
                          {group.rows.length} team(s) assigned to you · {group.files} file(s) available
                        </p>
                      </div>
                      <button
                        onClick={() => setCollapsed(prev => ({ ...prev, [groupKey]: !groupCollapsed }))}
                        className="self-start rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 md:self-auto"
                      >
                        {groupCollapsed ? `Show ${group.rows.length} team(s)` : 'Collapse'}
                      </button>
                    </div>
                  </div>
                  {!groupCollapsed && group.rows.map(([teamId, team]) => (
              <div key={teamId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Team</p>
                    <h2 className="text-xl font-bold text-slate-900">
                      {isAll && team.submissions[0]?.competition_name ? `${team.submissions[0].competition_name} · ` : ''}
                      {team.name}
                    </h2>
                    <p className="mt-1 text-base text-slate-600">
                      Team ID: {teamId} · {filesForTeam(teamId)} file(s) available to you
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <button
                      onClick={() => downloadTeamArchive(teamId, categoryFilter === 'all' ? null : categoryFilter)}
                      className="rounded-lg bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={filesForTeam(teamId, categoryFilter === 'all' ? null : categoryFilter) === 0}
                      title={filesForTeam(teamId, categoryFilter === 'all' ? null : categoryFilter) === 0
                        ? 'This team has no files in the selected deliverable category'
                        : `Download ${filesForTeam(teamId, categoryFilter === 'all' ? null : categoryFilter)} file(s)`}
                    >
                      Download visible files
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {filesForTeam(teamId) === 0 ? (
                    <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-center text-base text-amber-800">
                      This team has a submission record but has not uploaded any files yet, so there is nothing to download or score.
                    </p>
                  ) : visibleSubmissions(team).length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">No submissions in this category.</p>
                  ) : [...new Set(visibleSubmissions(team).map(sub => sub.deliverable_category || 'Uncategorized'))].map(category => {
                    const categorySubmissions = visibleSubmissions(team).filter(sub => (sub.deliverable_category || 'Uncategorized') === category)
                    return (
                    <section key={category} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-slate-800">{category}</h3>
                        <button
                          onClick={() => downloadTeamArchive(teamId, category === 'Uncategorized' ? null : category)}
                          className="self-start rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                          disabled={filesForTeam(teamId, category === 'Uncategorized' ? null : category) === 0}
                          title={filesForTeam(teamId, category === 'Uncategorized' ? null : category) === 0
                            ? 'No files in this deliverable category for this team'
                            : `Download ${filesForTeam(teamId, category === 'Uncategorized' ? null : category)} file(s)`}
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
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[sub.status] || 'bg-slate-100 text-slate-700'}`}>
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
              ))}
                </Fragment>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'scores' && (
        <div className="space-y-5">
          {showGuide && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-indigo-900">How to score a team</h2>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-base text-indigo-900">
                    <li>Open the <strong>Score Teams</strong> tab. Teams are grouped by category.</li>
                    <li>Open a team and type a whole number in each box. Each box accepts only the range shown next to it.</li>
                    <li>Your score saves by itself when you click away. You will see <span className="font-semibold">Score saved</span>.</li>
                    <li>Press <kbd className="rounded border border-indigo-300 bg-white px-1.5 py-0.5 text-sm">Enter</kbd> to save and jump to the next box, or <kbd className="rounded border border-indigo-300 bg-white px-1.5 py-0.5 text-sm">Shift + Enter</kbd> to go back.</li>
                    <li>Not sure? Use the <strong>Low / Good / Top</strong> buttons for a quick suggestion.</li>
                    <li>Finished a team? Use <strong>Score next team</strong> at the top to jump straight to the next one.</li>
                  </ol>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="shrink-0 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Hide
                </button>
              </div>
            </div>
          )}
          <div className="sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Team scoring</p>
                <h2 className="text-lg font-bold text-slate-900">Evaluate submitted teams</h2>
                <p className="mt-1 text-base text-slate-600">
                  Total possible: {maxScore} points across {criteria.length} criteria. Scores save automatically when you leave a box.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {criteria.map((c, i) => (
                    <span
                      key={c.id}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${criterionTones[i % criterionTones.length].chip}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${criterionTones[i % criterionTones.length].dot}`} />
                      {c.name} (max {c.weight})
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {scoreFilters.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setScoreFilter(f.key)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${scoreFilter === f.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="team-search" className="sr-only">Search team</label>
                  <input
                    id="team-search"
                    type="search"
                    placeholder="Search team ID or name"
                    value={searchTeam}
                    onChange={e => setSearchTeam(e.target.value)}
                    className="w-52 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                  {searchTeam && (
                    <button onClick={() => setSearchTeam('')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                      Clear
                    </button>
                  )}
                  <label htmlFor="sort-teams" className="sr-only">Sort teams</label>
                  <select
                    id="sort-teams"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  >
                    {sortOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                  <label htmlFor="filter-category" className="sr-only">Filter by category</label>
                  <select
                    id="filter-category"
                    value={scoreCategory}
                    onChange={e => setScoreCategory(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="all">All categories</option>
                    {categoryStats.map(c => (
                      <option key={c.name} value={c.name}>{c.name} ({c.teams})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              {nextUnscored && (
                <>
                  <button
                    onClick={() => focusTeam(nextUnscored.team_id)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-base font-semibold text-white hover:bg-indigo-700"
                  >
                    Score next team: {nextUnscored.team_name}
                  </button>
                  {prevTeam && (
                    <button
                      onClick={() => focusTeam(prevTeam.team_id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      &larr; Previous team
                    </button>
                  )}
                  {nextTeam && (
                    <button
                      onClick={() => focusTeam(nextTeam.team_id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Next team &rarr;
                    </button>
                  )}
                </>
              )}
              {!showGuide && (
                <button
                  onClick={() => setShowGuide(true)}
                  className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  How to score
                </button>
              )}
              {pendingRows.length > 0 && (
                <button
                  onClick={() => setShowEmptySubmissions(v => !v)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${showEmptySubmissions ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {showEmptySubmissions ? 'Hide' : 'Show'} {pendingRows.length} team(s) with no files yet
                </button>
              )}
              <span className="ml-auto text-sm text-slate-500">
                {visibleScoreRows.length} of {baseRows.length} team(s) shown
                {sortingAllTeams && !showEmptySubmissions ? ' (sorting includes teams with no files yet)' : ''}
              </span>
            </div>
          </div>

          {baseRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
              <p className="text-lg font-semibold text-amber-900">Nothing to score yet</p>
              <p className="mt-1 text-base text-amber-800">
                {assignments.length === 0
                  ? 'You have not been assigned any team yet, so there is nothing to score. Ask an admin to assign you teams in Admin -> Judge Management.'
                  : pendingRows.length > 0
                    ? `${pendingRows.length} team(s) created a submission but have not uploaded any file.`
                    : 'Teams appear here automatically as soon as they upload at least one file.'}
              </p>
            </div>
          ) : hasActiveFilter && visibleScoreRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No team matches the current search or filter.
            </div>
          ) : (
            scoreRenderList.map((t, rowIndex) => {
              const cat = t.__emptyCategory || categoryOf(t)
              const catKey = `cat:${cat}`
              const catCollapsed = Boolean(collapsed[catKey])
              const showCatHeader = t.__emptyCategory
                ? true
                : rowIndex === 0 || categoryOf(scoreRenderList[rowIndex - 1] || {}) !== cat
              const catRows = t.__emptyCategory ? [] : visibleScoreRows.filter(x => categoryOf(x) === cat)
              const catStat = categoryStats.find(c => c.name === cat)
              const tone = categoryTones[cat] || criterionTones[0]

              if (t.__emptyCategory) {
                return (
                  <Fragment key={`empty-${cat}`}>
                    {renderCategoryHeader(cat, [], catStat, tone)}
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                      <p className="text-base font-semibold text-slate-700">No team to show in this category</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {catStat && catStat.teams > 0
                          ? `${catStat.teams} team(s) submitted in this category but none has uploaded a file yet.`
                          : 'No team has submitted in this category yet.'}
                      </p>
                      {catStat && catStat.teams > 0 && (
                        <button
                          onClick={() => setShowEmptySubmissions(true)}
                          className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Show the {catStat.teams} team(s) with no files yet
                        </button>
                      )}
                    </div>
                  </Fragment>
                )
              }

              const evaluation = t.evaluation
              const avgScore = isAll ? null : getScoreForTeam(t.team_id)
              const pct = criteria.length > 0 ? Math.round((t.scoredCount / criteria.length) * 100) : 0
              const isCollapsed = Boolean(collapsed[t.team_id])
              return (
                <Fragment key={`${t.competition_id}-${t.team_id}`}>
                {showCatHeader && renderCategoryHeader(cat, catRows, catStat, tone)}
                {!catCollapsed && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Team</p>
                        {t.isComplete && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Scoring complete</span>
                        )}
                      </div>
                      <h2 className="truncate text-2xl font-bold text-slate-900">
                        {isAll && t.competition_name ? `${t.competition_name} · ` : ''}
                        {t.team_name || `Team ${t.team_id}`}
                      </h2>
                      <p className="mt-1 text-base text-slate-600">
                        Team ID: {t.team_id} · {t.file_count} file(s) in {t.deliverables_with_files} of {t.deliverables_total} deliverable(s)
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {!t.has_files && (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">No files uploaded yet</span>
                        )}
                        {t.isAssigned ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Assigned to you</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Not assigned to you</span>
                        )}
                        {(t.statuses || []).map(s => (
                          <span key={s} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[s] || 'bg-slate-100 text-slate-700'}`}>{s}</span>
                        ))}
                        {(t.categories || []).map(c => (
                          <span key={c} className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700" title="Deliverable category">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <div className="rounded-xl bg-indigo-50 px-4 py-3 text-lg font-bold text-indigo-700">
                        Your total: {t.myTotal}/{maxScore}
                      </div>
                      {avgScore && (
                        <div
                          className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600"
                          title="Judges who scored this team"
                        >
                          {avgScore.num_judges} judge(s) scored this team
                        </div>
                      )}
                      <button
                        onClick={() => setCollapsed(prev => ({ ...prev, [t.team_id]: !isCollapsed }))}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        {isCollapsed ? 'Expand scoring' : 'Collapse'}
                      </button>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-600">
                      <span>{t.scoredCount} of {criteria.length} criteria scored</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>

                    {!t.isAssigned && (
                      <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-base text-slate-600">
                        This team is not assigned to you, so scoring is disabled. Ask an admin to assign it to you if you should review it.
                      </p>
                    )}

                    {!isCollapsed && (
                      <>
                        {evaluation && t.isAssigned && (
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm text-slate-600">Your scoring record (ID {evaluation.id})</p>
                            <button
                              type="button"
                              onClick={() => handleClearEvaluation(evaluation)}
                              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={evaluation.status === 'LOCKED' || evaluation.status === 'FINALIZED'}
                              title={evaluation.status === 'LOCKED' || evaluation.status === 'FINALIZED'
                                ? 'The head judge has locked this team, so scores cannot be cleared'
                                : 'Delete every score you gave for this team'}
                            >
                              Clear all my scores for this team
                            </button>
                          </div>
                        )}

                        <div className="mt-4 overflow-x-auto pb-2">
                          <div
                            className="grid gap-4"
                            style={{
                              gridTemplateColumns: `repeat(${Math.min(criteria.length || 1, 4)}, minmax(230px, 1fr))`,
                            }}
                          >
                          {criteria.map((c, cIndex) => {
                            const tone = criterionTones[cIndex % criterionTones.length]
                            const existing = evaluation?.scores?.find(s => s.criterion === c.name || s.criterion_id === c.id)?.score
                            const localKey = `${t.team_id}-${c.id}`
                            const displayValue = localScores[localKey] !== undefined ? localScores[localKey] : (existing !== undefined ? existing : '')
                            const fieldError = scoreErrors[localKey]
                            const fieldStatus = scoreStatus[localKey]
                            return (
                              <div
                                key={c.id}
                                className={`rounded-2xl border border-l-4 bg-slate-50 p-4 transition ${fieldError ? 'border-red-300 border-l-red-400 ring-1 ring-red-200' : `border-slate-200 ${tone.left}`}`}
                              >
                                <div className="mb-3 flex items-center justify-between gap-2">
                                  <span
                                    className={`inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-base font-bold ${tone.chip}`}
                                    title={c.name}
                                  >
                                    <span className={`h-3 w-3 shrink-0 rounded-full ${tone.dot}`} />
                                    <label htmlFor={`score-${localKey}`} className="truncate">{c.name}</label>
                                  </span>
                                  <span className="shrink-0 whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700">
                                    1 to {c.weight}
                                  </span>
                                </div>
                                <input
                                  id={`score-${localKey}`}
                                  ref={el => { scoreInputs.current[localKey] = el }}
                                  type="number"
                                  inputMode="numeric"
                                  min="1"
                                  max={c.weight}
                                  step="1"
                                  disabled={!t.isAssigned}
                                  placeholder={`Type 1-${c.weight}`}
                                  value={displayValue}
                                  onChange={e => {
                                    const raw = e.target.value.trim()
                                    if (raw === '') {
                                      setLocalScores(prev => ({ ...prev, [localKey]: '' }))
                                      setScoreErrors(prev => { const next = { ...prev }; delete next[localKey]; return next })
                                      return
                                    }
                                    if (!/^\d+$/.test(raw)) {
                                      setScoreErrors(prev => ({ ...prev, [localKey]: `Score must be a whole number from 1 to ${c.weight}` }))
                                      return
                                    }
                                    const val = parseInt(raw, 10)
                                    if (val < 1 || val > c.weight) {
                                      setScoreErrors(prev => ({ ...prev, [localKey]: `Score must be a whole number from 1 to ${c.weight}` }))
                                      return
                                    }
                                    setLocalScores(prev => ({ ...prev, [localKey]: val }))
                                    setScoreErrors(prev => { const next = { ...prev }; delete next[localKey]; return next })
                                  }}
                                  onBlur={() => applyScore(t.team_id, c, localKey)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      applyScore(t.team_id, c, localKey)
                                      moveFocus(t.team_id, c, e.shiftKey ? -1 : 1)
                                    }
                                  }}
                                  aria-invalid={fieldError ? true : undefined}
                                  aria-describedby={fieldError ? `err-${localKey}` : undefined}
                                  className={`w-full rounded-xl border-2 bg-white px-4 py-4 text-center text-2xl font-bold focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${fieldError ? 'border-red-500 focus:border-red-500' : 'border-slate-400 focus:border-indigo-500'}`}
                                />

                                {t.isAssigned && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {quickScores.map(q => {
                                      const qv = Math.max(1, Math.round(c.weight * q.pct))
                                      return (
                                        <button
                                          key={q.label}
                                          type="button"
                                          onClick={() => {
                                            setLocalScores(prev => ({ ...prev, [localKey]: qv }))
                                            setScoreErrors(prev => { const next = { ...prev }; delete next[localKey]; return next })
                                            applyScore(t.team_id, c, localKey)
                                          }}
                                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                                          title={`Set ${qv} of ${c.weight}`}
                                        >
                                          {q.label} {qv}
                                        </button>
                                      )
                                    })}
                                    <button
                                      type="button"
                                      onClick={() => setShowNotes(prev => ({ ...prev, [localKey]: !prev[localKey] }))}
                                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                                    >
                                      {showNotes[localKey] ? 'Hide note' : 'Add note'}
                                    </button>
                                  </div>
                                )}

                                <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                                  <span>Lowest: 1</span>
                                  <span>Highest: {c.weight}</span>
                                </div>

                                {showNotes[localKey] && (
                                  <input
                                    type="text"
                                    placeholder="Optional note (saved with the score)"
                                    value={notes[localKey] || ''}
                                    onChange={e => setNotes(prev => ({ ...prev, [localKey]: e.target.value }))}
                                    onBlur={() => applyScore(t.team_id, c, localKey)}
                                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                                  />
                                )}

                                {fieldError ? (
                                  <p id={`err-${localKey}`} className="mt-2 text-sm font-medium text-red-600">{fieldError}</p>
                                ) : fieldStatus === 'saving' ? (
                                  <p className="mt-2 text-sm font-medium text-slate-500">Saving...</p>
                                ) : fieldStatus === 'saved' ? (
                                  <p className="mt-2 text-sm font-medium text-emerald-600">Score saved</p>
                                ) : null}
                              </div>
                            )
                          })}
                          </div>
                        </div>

                        {t.isAssigned && t.teamSubs.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                            <span className="text-xs text-slate-500">
                              {t.teamSubs.reduce((n, s) => n + (s.files?.length || 0), 0)} file(s) available to you
                            </span>
                            <button
                              onClick={() => downloadTeamArchive(t.team_id, null)}
                              className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                            >
                              Download team files
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                )}
                </Fragment>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
