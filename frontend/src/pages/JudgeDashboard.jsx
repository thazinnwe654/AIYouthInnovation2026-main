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
import { getFileIcon, formatFileSize, safeExternalUrl } from '../utils'

// Opens the team's demo video in a new tab. Renders nothing when the team has no
// link, or when the stored value is not a safe http(s) address.
function DemoLink({ url, className = '' }) {
  const safe = safeExternalUrl(url)
  if (!safe) return null
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-semibold text-rose-600 underline decoration-rose-300 hover:text-rose-700 hover:decoration-rose-500 ${className}`}
      title={`Open the demo video (${safe})`}
    >
      <span aria-hidden="true">▶</span> Watch demo
    </a>
  )
}

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
  { key: 'todo', label: 'Unscored' },
  { key: 'done', label: 'Completed' },
]

const sortOptions = [
  { key: 'todo', label: 'Unscored first' },
  { key: 'name', label: 'Team name (A-Z)' },
  { key: 'files', label: 'Most files' },
]

function Chevron({ expanded }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// One button style for every show/hide control, so the labels stay explicit
// about what is being hidden instead of a bare "Hide" or "Collapse".
const toggleButtonClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100'

// One palette entry per competition category: the dot marks it, the text colour
// separates the category headings at a glance, and the rule underlines the
// section so a long list of teams stays readable.
const TONE_PALETTE = [
  { dot: 'bg-indigo-500', name: 'text-indigo-700', count: 'text-indigo-500', rule: 'bg-indigo-200' },
  { dot: 'bg-emerald-500', name: 'text-emerald-700', count: 'text-emerald-600', rule: 'bg-emerald-200' },
  { dot: 'bg-amber-500', name: 'text-amber-700', count: 'text-amber-600', rule: 'bg-amber-200' },
  { dot: 'bg-sky-500', name: 'text-sky-700', count: 'text-sky-600', rule: 'bg-sky-200' },
  { dot: 'bg-rose-500', name: 'text-rose-700', count: 'text-rose-600', rule: 'bg-rose-200' },
  { dot: 'bg-violet-500', name: 'text-violet-700', count: 'text-violet-600', rule: 'bg-violet-200' },
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
  const [showGuide, setShowGuide] = useState(false)
  const [showFiles, setShowFiles] = useState({})
  const [pendingFocus, setPendingFocus] = useState(null)
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
      return true
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
      return false
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

  const applyScore = async (teamId, criterion, localKey) => {
    const raw = localScores[localKey]
    if (raw === '' || raw === undefined || raw === null) return
    const val = parseInt(String(raw), 10)
    if (Number.isNaN(val) || val < 1 || val > criterion.weight) return
    const alreadySaved = savedScoreFor(teamId, criterion)
    const saved = await handleScoreSubmit(teamId, criterion.id, val, notes[localKey] || '', localKey)
    // Only react to a real change, so re-saving an untouched box does not
    // pull the judge off the team they are correcting.
    if (saved && alreadySaved !== val) advanceAfterTeamDone(localKey)
  }

  // Leaving a box settles it: a clean whole number in range is saved, and
  // anything else (empty, "05", "35" on a 30-point criterion) falls back to the
  // last score the server accepted.
  const commitScore = (teamId, criterion, localKey) => {
    const raw = String(localScores[localKey] ?? '').trim()
    if (raw === '') {
      setLocalScores(prev => ({ ...prev, [localKey]: '' }))
      clearFieldError(localKey)
      return
    }
    const val = parseInt(raw, 10)
    if (Number.isNaN(val) || val < 1 || val > criterion.weight) {
      const saved = savedScoreFor(teamId, criterion)
      setLocalScores(prev => ({ ...prev, [localKey]: saved !== undefined ? saved : '' }))
      setScoreErrors(prev => ({ ...prev, [localKey]: `Enter 1-${criterion.weight}` }))
      return
    }
    if (String(val) !== raw) setLocalScores(prev => ({ ...prev, [localKey]: val }))
    clearFieldError(localKey)
    applyScore(teamId, criterion, localKey)
  }

  const focusScoreKey = (key) => {
    const el = scoreInputs.current[key]
    if (!el) return false
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.focus()
    if (typeof el.select === 'function') el.select()
    return true
  }

  const teamIdOf = (key) => key.slice(0, key.indexOf('-'))

  // A box can be inside a collapsed team or a collapsed category, so the
  // element may not exist yet. Ask for it, and focus it once React has rendered.
  const requestFocus = (key) => {
    const teamId = teamIdOf(key)
    setCollapsed(prev => (prev[teamId] ? { ...prev, [teamId]: false } : prev))
    const row = visibleScoreRows.find(t => String(t.team_id) === teamId)
    if (row) {
      const catKey = `cat:${categoryOf(row)}`
      setCollapsed(prev => (prev[catKey] ? { ...prev, [catKey]: false } : prev))
    }
    setPendingFocus(key)
  }

  const gotoScoreKey = (key) => {
    if (!key) return
    if (!focusScoreKey(key)) requestFocus(key)
  }

  useEffect(() => {
    if (!pendingFocus) return
    if (focusScoreKey(pendingFocus)) setPendingFocus(null)
  }, [pendingFocus])

  const stepScore = (localKey, delta) => {
    const idx = scoreOrder.indexOf(localKey)
    if (idx === -1) return
    gotoScoreKey(scoreOrder[idx + delta])
  }

  // scoreOrder is team-major (every criterion of a team, then the next team), so
  // jumping one team up or down is a jump of exactly one team width.
  const stepTeam = (localKey, delta) => {
    const idx = scoreOrder.indexOf(localKey)
    if (idx === -1) return
    gotoScoreKey(scoreOrder[idx + delta * Math.max(criteria.length, 1)])
  }

  const savedScoreFor = (teamId, criterion) =>
    getEvaluationForTeam(teamId)?.scores
      ?.find(s => s.criterion_id === criterion.id || s.criterion === criterion.name)?.score

  const clearFieldError = (localKey) =>
    setScoreErrors(prev => {
      if (!(localKey in prev)) return prev
      const next = { ...prev }
      delete next[localKey]
      return next
    })

  const isScoreFilled = (value, weight) => {
    const raw = String(value ?? '').trim()
    if (raw === '') return false
    const n = parseInt(raw, 10)
    return !Number.isNaN(n) && n >= 1 && n <= weight
  }

  const teamIsFilled = (teamId) => {
    const prefix = `${teamId}-`
    const keys = scoreOrder.filter(k => k.startsWith(prefix))
    if (keys.length === 0) return false
    return keys.every(k => {
      const critId = Number(k.slice(k.indexOf('-') + 1))
      const crit = criteria.find(c => c.id === critId)
      return isScoreFilled(localScores[k], crit ? crit.weight : maxScore)
    })
  }

  // Finishing the last box of a team pulls the next team into view by itself,
  // so the judge never has to reach for a "next" button.
  const advanceAfterTeamDone = (localKey) => {
    const teamId = teamIdOf(localKey)
    if (!teamIsFilled(teamId)) return
    // The save is async. If the judge has already tabbed into another box and
    // started typing, Tab/Enter already did the moving, so stay out of the way.
    const activeKey = document.activeElement?.getAttribute?.('data-score-key')
    if (activeKey && activeKey !== localKey) return
    const idx = scoreOrder.indexOf(localKey)
    gotoScoreKey(scoreOrder[idx + 1])
  }

  const renderCategoryHeader = (cat, catRows, catStat, tone) => {
    const catKey = `cat:${cat}`
    const catCollapsed = Boolean(collapsed[catKey])
    // Progress is always "scored out of the teams that submitted", never out of
    // every team in the category.
    const submitted = catStat ? catStat.withFiles : 0
    const done = catStat ? catStat.scored : catRows.filter(x => x.isComplete).length
    return (
      <div className="px-1 pt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
          <h3 className={`truncate text-sm font-bold uppercase tracking-wider ${tone.name}`}>{cat}</h3>
          <span className={`text-sm font-medium tabular-nums ${tone.count}`}>
            {done}/{submitted} scored
            {catStat ? ` · ${catStat.files} file${catStat.files === 1 ? '' : 's'}` : ''}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {catRows.length > 0 && (
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, [catKey]: !catCollapsed }))}
                className={toggleButtonClass}
                aria-expanded={!catCollapsed}
              >
                <Chevron expanded={!catCollapsed} />
                {catCollapsed ? `Show ${catRows.length} teams` : 'Hide teams'}
              </button>
            )}
          </div>
        </div>
        <div className={`mt-2 h-0.5 w-full rounded-full ${tone.rule} opacity-60`} />
      </div>
    )
  }

  if (loading) return <div className="p-6 text-slate-600">Loading dashboard...</div>

  const teams = {}
  submissions.forEach(sub => {
    if (!teams[sub.team_id]) {
      teams[sub.team_id] = {
        name: sub.team_name,
        productName: sub.product_name,
        youtubeUrl: sub.youtube_url,
        submissions: [],
      }
    }
    teams[sub.team_id].submissions.push(sub)
  })
  const teamList = Object.entries(teams)
  const filteredTeams = searchTeam
    ? teamList.filter(([teamId, team]) =>
        String(teamId) === String(searchTeam) ||
        team.name.toLowerCase().includes(searchTeam.toLowerCase()) ||
        (team.productName || '').toLowerCase().includes(searchTeam.toLowerCase())
      )
    : teamList

  // Files tab grouping: competition category (AI for Engineering / Social / Entrepreneurship)
  const teamCategoryMap = {}
  const productByTeam = {}
  const youtubeByTeam = {}
  submittedTeams.forEach(t => {
    teamCategoryMap[t.team_id] = t.competition_category
    productByTeam[t.team_id] = t.product_name
    youtubeByTeam[t.team_id] = t.youtube_url
  })
  const categoryOfTeam = (teamId) => teamCategoryMap[teamId] || 'Uncategorized'

  // The Files tab lists only teams that actually uploaded something. Teams with
  // an empty submission record are reached from the Score Teams tab instead, so
  // every count on this tab matches what the judge can open.
  const teamsWithFiles = filteredTeams.filter(([, team]) =>
    team.submissions.some(sub => (sub.files?.length || 0) > 0)
  )

  const fileGroups = []
  teamsWithFiles.forEach(([teamId, team]) => {
    const cat = categoryOfTeam(teamId)
    let group = fileGroups.find(g => g.name === cat)
    if (!group) {
      group = { name: cat, rows: [], files: 0 }
      fileGroups.push(group)
    }
    group.rows.push([teamId, team])
    group.files += team.submissions.reduce((n, s) => n + (s.files?.length || 0), 0)
  })
  const fileGroupTones = {}
  fileGroups.forEach((g, i) => { fileGroupTones[g.name] = TONE_PALETTE[i % TONE_PALETTE.length] })
  const visibleFileGroups = fileCategory === 'all'
    ? fileGroups
    : fileGroups.filter(g => g.name === fileCategory)

  const fileTeamCount = teamsWithFiles.length
  const fileCountTotal = teamsWithFiles.reduce(
    (n, [, team]) => n + team.submissions.reduce((m, sub) => m + (sub.files?.length || 0), 0),
    0
  )

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
      isAssigned: true,
      evaluation,
      myTotal: myScores.reduce((sum, s) => sum + (s.score || 0), 0),
      scoredCount: myScores.length,
      teamSubs,
      isComplete: criteria.length > 0 && myScores.length >= criteria.length,
    }
  }

  // A judge may only see and score the teams assigned to them. The server already
  // scopes /judges/submitted-teams this way, so this filter is a second line of
  // defence rather than the only one.
  const allRows = submittedTeams.filter(t => t.is_assigned).map(decorateTeam)
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
  if (scoreFilter === 'todo') visibleScoreRows = visibleScoreRows.filter(t => t.isAssigned && !t.isComplete)
  if (scoreFilter === 'done') visibleScoreRows = visibleScoreRows.filter(t => t.isAssigned && t.isComplete)

  const categoryOf = (t) => t.competition_category || 'Uncategorized'
  const categoriesInView = [...new Set(allRows.map(categoryOf))].sort()
  if (scoreCategory !== 'all') {
    visibleScoreRows = visibleScoreRows.filter(t => categoryOf(t) === scoreCategory)
  }
  const categoryStats = categoriesInView.map(cat => {
    const rows = allRows.filter(t => categoryOf(t) === cat)
    // "Submitted" means the team actually uploaded a file. Everything the judge
    // is told, and every progress fraction, is measured against that subset so
    // the numbers never fall back to the raw team count.
    const submittedRows = rows.filter(t => t.has_files)
    return {
      name: cat,
      teams: rows.length,
      withFiles: submittedRows.length,
      scored: submittedRows.filter(t => t.isComplete).length,
      files: submittedRows.reduce((n, t) => n + (t.file_count || 0), 0),
    }
  })
  const categoryTones = {}
  categoriesInView.forEach((cat, i) => { categoryTones[cat] = TONE_PALETTE[i % TONE_PALETTE.length] })

  // With no category filter every competition category is rendered, even the ones
  // with nothing submitted, so the judge sees the full picture. Once a category is
  // chosen, the others are dropped entirely rather than left as empty sections.
  const scoreCategoryNames = scoreCategory === 'all'
    ? categoriesInView
    : categoriesInView.filter(cat => cat === scoreCategory)

  const scoreSections = scoreCategoryNames.map(name => ({
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

  // Visual order of every editable score box: team by team, criterion by criterion.
  // Tab / Shift+Tab walk this list so the judge can type a whole run of scores
  // without ever leaving the keyboard.
  const scoreOrder = []
  for (const t of scoreRenderList) {
    if (t.__emptyCategory || !t.isAssigned) continue
    for (const c of criteria) scoreOrder.push(`${t.team_id}-${c.id}`)
  }

  // Counted from every submitted team, not from the current sort/filter view, so
  // the numbers stay put when the judge changes the sort. "Submitted" means the
  // team actually uploaded a file and is assigned to this judge.
  const reviewRows = allRows.filter(t => t.isAssigned && t.has_files)
  const reviewTotal = reviewRows.length
  const reviewDone = reviewRows.filter(t => t.isComplete).length
  const reviewLeft = reviewTotal - reviewDone
  const reviewFiles = reviewRows.reduce((sum, t) => sum + (t.file_count || 0), 0)

  const visibleSubmissions = (team) => categoryFilter === 'all'
    ? team.submissions
    : team.submissions.filter(sub => sub.deliverable_category === categoryFilter)

  const summaryCards = [
    { label: 'Teams to review', value: reviewTotal, tone: 'indigo' },
    { label: 'Scored', value: reviewDone, tone: 'sky' },
    { label: 'Left to score', value: reviewLeft, tone: 'emerald' },
    { label: 'Files waiting', value: reviewFiles, tone: 'amber' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Judge Dashboard</h1>
          <Link
            to={isAll ? '/judge-dashboard?comp=1' : '/judge-dashboard?comp=all'}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {isAll ? 'Competition 1' : 'All competitions'}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('files')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'files'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            View Files
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'scores'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Score Teams
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
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

      {activeTab === 'files' && (
        <div className="space-y-5">
          <div className="sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="file-search" className="sr-only">Search team</label>
              <input
                id="file-search"
                type="search"
                placeholder="Search team"
                value={searchTeam}
                onChange={e => setSearchTeam(e.target.value)}
                className="w-36 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              />

              <label htmlFor="file-comp-category" className="sr-only">Competition category</label>
              <select
                id="file-comp-category"
                value={fileCategory}
                onChange={e => setFileCategory(e.target.value)}
                className="max-w-52 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              >
                <option value="all">All categories</option>
                {categoryStats.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.withFiles} submitted)</option>
                ))}
              </select>

              <label htmlFor="file-category" className="sr-only">Deliverable category</label>
              <select
                id="file-category"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="max-w-52 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              >
                <option value="all">All deliverable types</option>
                {deliverableStats.map(d => (
                  <option key={d.name} value={d.name}>{d.name} ({d.files})</option>
                ))}
              </select>

              {(fileCategory !== 'all' || categoryFilter !== 'all' || searchTeam) && (
                <button
                  onClick={() => { setFileCategory('all'); setCategoryFilter('all'); setSearchTeam('') }}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  Reset
                </button>
              )}

              <span className="ml-auto text-sm font-medium tabular-nums text-slate-600">
                {fileTeamCount} team{fileTeamCount === 1 ? '' : 's'} · {fileCountTotal} file{fileCountTotal === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          {teamsWithFiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
              <p className="text-lg font-semibold text-amber-900">No files to show yet</p>
              <p className="mt-1 text-base text-amber-800">
                {assignments.length === 0
                  ? 'You have not been assigned any team yet, so there are no files to open. Ask an admin to assign you teams in Admin -> Judge Management, and they will appear here.'
                  : searchTeam
                    ? `No assigned team matching "${searchTeam}" has uploaded a file.`
                    : 'No assigned team has uploaded a file yet. Teams that have not submitted are listed on the Score Teams tab.'}
              </p>
            </div>
          ) : visibleFileGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-base font-semibold text-slate-700">No submitted team in this category</p>
              <p className="mt-1 text-sm text-slate-500">
                Pick another category, or use the Score Teams tab to see every team that has not uploaded a file yet.
              </p>
            </div>
          ) : (
            visibleFileGroups.map(group => {
              const tone = fileGroupTones[group.name] || TONE_PALETTE[0]
              const groupKey = `files:${group.name}`
              const groupCollapsed = Boolean(collapsed[groupKey])
              return (
                <Fragment key={group.name}>
                  <div className="px-1 pt-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
                      <h2 className={`truncate text-sm font-bold uppercase tracking-wider ${tone.name}`}>{group.name}</h2>
                      <span className={`text-sm font-medium tabular-nums ${tone.count}`}>
                        {group.rows.length} team{group.rows.length === 1 ? '' : 's'} · {group.files} file{group.files === 1 ? '' : 's'}
                      </span>
                      <button
                        onClick={() => setCollapsed(prev => ({ ...prev, [groupKey]: !groupCollapsed }))}
                        className={`${toggleButtonClass} ml-auto`}
                        aria-expanded={!groupCollapsed}
                      >
                        <Chevron expanded={!groupCollapsed} />
                        {groupCollapsed ? `Show ${group.rows.length} teams` : 'Hide teams'}
                      </button>
                    </div>
                    <div className={`mt-2 h-0.5 w-full rounded-full ${tone.rule} opacity-60`} />
                  </div>
                  {!groupCollapsed && group.rows.map(([teamId, team]) => (
              <div key={teamId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-medium text-slate-500">Team Name:</span>
                      <span className="text-xl font-bold text-slate-900" title={team.name}>
                        {isAll && team.submissions[0]?.competition_name ? `${team.submissions[0].competition_name} · ` : ''}
                        {team.name}
                      </span>
                    </p>
                    {(team.productName || productByTeam[teamId]) && (
                      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-medium text-slate-500">Project Name:</span>
                        <span
                          className="text-base font-semibold text-indigo-600"
                          title={team.productName || productByTeam[teamId]}
                        >
                          {team.productName || productByTeam[teamId]}
                        </span>
                      </p>
                    )}
                    {(team.youtubeUrl || youtubeByTeam[teamId]) && (
                      <p className="mt-0.5 flex items-baseline gap-x-2 text-sm">
                        <span className="font-medium text-slate-500">Demo:</span>
                        <DemoLink url={team.youtubeUrl || youtubeByTeam[teamId]} className="text-base" />
                      </p>
                    )}
                    <p className="mt-1 text-sm text-slate-500">
                      #{teamId} · {filesForTeam(teamId)} file(s) available to you
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
        <div className="space-y-4">
          <div className="sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${reviewTotal ? Math.round((reviewDone / reviewTotal) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums text-slate-700">{reviewDone}/{reviewTotal}</span>
              </div>

              <label htmlFor="score-filter" className="sr-only">Filter teams</label>
              <select
                id="score-filter"
                value={scoreFilter}
                onChange={e => setScoreFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              >
                {scoreFilters.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>

              <label htmlFor="team-search" className="sr-only">Search team</label>
              <input
                id="team-search"
                type="search"
                placeholder="Search team"
                value={searchTeam}
                onChange={e => setSearchTeam(e.target.value)}
                className="w-36 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              />

              <label htmlFor="filter-category" className="sr-only">Filter by category</label>
              <select
                id="filter-category"
                value={scoreCategory}
                onChange={e => setScoreCategory(e.target.value)}
                className="max-w-44 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              >
                <option value="all">All categories</option>
                {categoryStats.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.withFiles} submitted)</option>
                ))}
              </select>

              <label htmlFor="sort-teams" className="sr-only">Sort teams</label>
              <select
                id="sort-teams"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              >
                {sortOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>

              {pendingRows.length > 0 && (
                <button
                  onClick={() => setShowEmptySubmissions(v => !v)}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${showEmptySubmissions ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  No files ({pendingRows.length})
                </button>
              )}

              {hasActiveFilter && (
                <button
                  onClick={() => { setSearchTeam(''); setScoreFilter('all'); setScoreCategory('all') }}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  Reset
                </button>
              )}

              <span className="ml-auto hidden text-xs text-slate-400 sm:inline">
                Enter next &middot; &larr;&rarr; criteria &middot; &uarr;&darr; team
              </span>
              <button
                onClick={() => setShowGuide(v => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                aria-expanded={showGuide}
              >
                <Chevron expanded={showGuide} />
                {showGuide ? 'Hide help' : 'How to score'}
              </button>
            </div>
          </div>

          {showGuide && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
              <ol className="list-decimal space-y-1 pl-5">
                <li>Type a whole number in each box. Letters, spaces and stray characters are cleaned up for you.</li>
                <li><kbd className="rounded border border-indigo-300 bg-white px-1">Enter</kbd> saves the box and puts the cursor in the next one &mdash; Innovation to Feasibility, and the last criterion to the first box of the next team.</li>
                <li><kbd className="rounded border border-indigo-300 bg-white px-1">Shift+Enter</kbd> goes back one box, and <kbd className="rounded border border-indigo-300 bg-white px-1">Tab</kbd> / <kbd className="rounded border border-indigo-300 bg-white px-1">Shift+Tab</kbd> do the same.</li>
                <li><kbd className="rounded border border-indigo-300 bg-white px-1">&larr;</kbd> and <kbd className="rounded border border-indigo-300 bg-white px-1">&rarr;</kbd> move between the criteria of the same team.</li>
                <li><kbd className="rounded border border-indigo-300 bg-white px-1">&uarr;</kbd> and <kbd className="rounded border border-indigo-300 bg-white px-1">&darr;</kbd> jump to the same criterion on the team above or below.</li>
                <li><kbd className="rounded border border-indigo-300 bg-white px-1">Ctrl+&uarr;</kbd> / <kbd className="rounded border border-indigo-300 bg-white px-1">Ctrl+&darr;</kbd> raise or lower the score in place, add <kbd className="rounded border border-indigo-300 bg-white px-1">Shift</kbd> for steps of 5.</li>
                <li>Out of range, the box returns to its last saved score and the range is shown under it.</li>
              </ol>
            </div>
          )}

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
              <p className="text-base font-semibold text-slate-700">
                {scoreCategory !== 'all'
                  ? `No submitted team in ${scoreCategory}`
                  : 'No team matches the current search or filter.'}
              </p>
              <p className="mt-1 text-sm">
                {scoreCategory !== 'all'
                  ? 'Pick another category, or choose "All categories" to see every team.'
                  : 'Clear the search box or pick "All" to widen the view.'}
              </p>
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
              const tone = categoryTones[cat] || TONE_PALETTE[0]

              if (t.__emptyCategory) {
                return (
                  <Fragment key={`empty-${cat}`}>
                    {renderCategoryHeader(cat, [], catStat, tone)}
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                      <p className="text-base font-semibold text-slate-700">No submitted team in this category</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {catStat && catStat.teams > catStat.withFiles
                          ? `${catStat.teams - catStat.withFiles} team(s) here have not uploaded a file yet.`
                          : 'No team has uploaded a file in this category yet.'}
                      </p>
                      {catStat && catStat.teams > 0 && (
                        <button
                          onClick={() => setShowEmptySubmissions(true)}
                          className="mt-3 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          Show {catStat.teams} team(s) without files
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
              const fileCount = t.teamSubs.reduce((n, s) => n + (s.files?.length || 0), 0)
              const filesOpen = Boolean(showFiles[t.team_id])
              return (
                <Fragment key={`${t.competition_id}-${t.team_id}`}>
                {showCatHeader && renderCategoryHeader(cat, catRows, catStat, tone)}
                {!catCollapsed && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-medium text-slate-500">Team Name:</span>
                        <span className="truncate text-lg font-bold text-slate-900" title={t.team_name}>
                          {t.team_name || `Team ${t.team_id}`}
                        </span>
                        {t.isComplete && (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Done</span>
                        )}
                        {!t.has_files && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">No files</span>
                        )}
                      </p>
                      {t.product_name && (
                        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-medium text-slate-500">Project Name:</span>
                          <span className="truncate text-sm font-semibold text-indigo-600" title={t.product_name}>
                            {t.product_name}
                          </span>
                        </p>
                      )}
                      {t.youtube_url && (
                        <p className="mt-0.5 flex items-baseline gap-x-2 text-sm">
                          <span className="font-medium text-slate-500">Demo:</span>
                          <DemoLink url={t.youtube_url} />
                        </p>
                      )}
                      <p className="mt-0.5 text-sm text-slate-500">
                        #{t.team_id}
                        {isAll && t.competition_name ? ` · ${t.competition_name}` : ''}
                        {' · '}{t.scoredCount}/{criteria.length} scored
                        {avgScore ? ` · ${avgScore.num_judges} judge(s)` : ''}
                      </p>
                      <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
                        <div className="h-1.5 rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-base font-bold tabular-nums text-indigo-700">
                        {t.myTotal}<span className="text-sm font-semibold text-indigo-400">/{maxScore}</span>
                      </span>
                      {t.isAssigned && t.teamSubs.length > 0 && (
                        <button
                          onClick={() => setShowFiles(prev => ({ ...prev, [t.team_id]: !prev[t.team_id] }))}
                          className={toggleButtonClass}
                          aria-expanded={Boolean(showFiles[t.team_id])}
                        >
                          <Chevron expanded={Boolean(showFiles[t.team_id])} />
                          View files ({fileCount})
                        </button>
                      )}
                      <button
                        onClick={() => setCollapsed(prev => ({ ...prev, [t.team_id]: !isCollapsed }))}
                        className={toggleButtonClass}
                        aria-expanded={!isCollapsed}
                      >
                        <Chevron expanded={!isCollapsed} />
                        {isCollapsed ? 'Show score boxes' : 'Hide score boxes'}
                      </button>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    {!t.isAssigned && (
                      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Not assigned to you, so scoring is disabled. Ask an admin to assign this team if you should review it.
                      </p>
                    )}

                    {filesOpen && (
                      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {t.teamSubs.filter(sub => (sub.files?.length || 0) > 0).map(sub => (
                          <div key={sub.submission_id} className="mb-2 last:mb-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {sub.deliverable_name}
                            </p>
                            {sub.files.map(f => (
                              <div key={f.id} className="flex items-center gap-2 border-b border-slate-200/70 py-1.5 last:border-0">
                                <span aria-hidden="true" className="text-base">{getFileIcon(f.original_filename)}</span>
                                <span className="min-w-0 flex-1 truncate text-sm text-slate-700" title={f.original_filename}>
                                  {f.original_filename}
                                </span>
                                <span className="shrink-0 text-xs text-slate-400">{formatFileSize(f.file_size)}</span>
                                <button
                                  onClick={() => downloadFile(sub.submission_id, f.id, f.original_filename).catch(err => setError(err.message))}
                                  className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        ))}
                        {fileCount > 0 && (
                          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                            <span className="text-xs text-slate-500">
                              {fileCount} file(s) · nothing is downloaded until you ask
                            </span>
                            <button
                              onClick={() => downloadTeamArchive(t.team_id, null)}
                              className="rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                            >
                              Download all as ZIP
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {!isCollapsed && (
                      <>
                        {evaluation && t.isAssigned && (
                          <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleClearEvaluation(evaluation)}
                              className="rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={evaluation.status === 'LOCKED' || evaluation.status === 'FINALIZED'}
                              title={evaluation.status === 'LOCKED' || evaluation.status === 'FINALIZED'
                                ? 'The head judge has locked this team, so scores cannot be cleared'
                                : 'Delete every score you gave for this team'}
                            >
                              Clear my scores
                            </button>
                          </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {criteria.map((c) => {
                            const existing = evaluation?.scores?.find(s => s.criterion === c.name || s.criterion_id === c.id)?.score
                            const localKey = `${t.team_id}-${c.id}`
                            const displayValue = localScores[localKey] !== undefined ? localScores[localKey] : (existing !== undefined ? existing : '')
                            const fieldError = scoreErrors[localKey]
                            const fieldStatus = scoreStatus[localKey]
                            return (
                              <div
                                key={c.id}
                                className={`rounded-xl border bg-slate-50 p-3 transition ${fieldError ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'}`}
                              >
                                <label
                                  htmlFor={`score-${localKey}`}
                                  className="mb-1.5 flex items-baseline gap-1 text-sm font-semibold text-slate-700"
                                >
                                  <span className="truncate">{c.name}</span>
                                  <span className="shrink-0 text-xs font-medium text-slate-400">/ {c.weight}</span>
                                </label>
                                <input
                                  id={`score-${localKey}`}
                                  ref={el => { scoreInputs.current[localKey] = el }}
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  data-score-key={localKey}
                                  disabled={!t.isAssigned}
                                  placeholder="–"
                                  value={displayValue}
                                  onChange={e => {
                                    // Keep whatever the judge typed minus any stray
                                    // characters, instead of refusing the keystroke.
                                    const digits = e.target.value.replace(/\D/g, '')
                                    setLocalScores(prev => ({ ...prev, [localKey]: digits }))
                                    const n = parseInt(digits, 10)
                                    if (digits !== '' && (Number.isNaN(n) || n < 1 || n > c.weight)) {
                                      setScoreErrors(prev => ({ ...prev, [localKey]: `Enter 1-${c.weight}` }))
                                    } else {
                                      clearFieldError(localKey)
                                    }
                                  }}
                                  onFocus={e => {
                                    if (e.target.value) e.target.select()
                                  }}
                                  onBlur={() => commitScore(t.team_id, c, localKey)}
                                  onKeyDown={e => {
                                    if (e.key === 'Tab') {
                                      // Walk only the score boxes so the judge never
                                      // lands on a filter, a note field or a button.
                                      // preventDefault() cancels the native focus move,
                                      // so blur() is what commits the score.
                                      e.preventDefault()
                                      e.currentTarget.blur()
                                      stepScore(localKey, e.shiftKey ? -1 : 1)
                                      return
                                    }
                                    if (e.key === 'Enter') {
                                      // Enter always leaves the box, even when it is
                                      // empty or the value was not changed.
                                      e.preventDefault()
                                      e.currentTarget.blur()
                                      stepScore(localKey, e.shiftKey ? -1 : 1)
                                      return
                                    }
                                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                      // Left and right walk the criteria of this team.
                                      // The values are one or two digits, so giving up
                                      // caret movement costs the judge very little.
                                      e.preventDefault()
                                      e.currentTarget.blur()
                                      stepScore(localKey, e.key === 'ArrowRight' ? 1 : -1)
                                      return
                                    }
                                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                      e.preventDefault()
                                      const dir = e.key === 'ArrowUp' ? 1 : -1
                                      if (e.ctrlKey || e.metaKey || e.altKey) {
                                        // Adjust this score instead of leaving the box.
                                        const current = parseInt(String(localScores[localKey] ?? ''), 10)
                                        const base = Number.isNaN(current)
                                          ? (savedScoreFor(t.team_id, c) || 0)
                                          : current
                                        const next = Math.min(c.weight, Math.max(1, base + dir * (e.shiftKey ? 5 : 1)))
                                        setLocalScores(prev => ({ ...prev, [localKey]: next }))
                                        clearFieldError(localKey)
                                        return
                                      }
                                      // Up and down move to the same criterion on the
                                      // team above or below.
                                      e.currentTarget.blur()
                                      stepTeam(localKey, dir)
                                    }
                                  }}
                                  title="Enter next · Shift+Enter back · ← → criteria · ↑ ↓ team · Ctrl+↑ ↓ adjust"
                                  aria-label={`${t.team_name || `Team ${t.team_id}`} - ${c.name} out of ${c.weight}`}
                                  aria-invalid={fieldError ? true : undefined}
                                  aria-describedby={fieldError ? `err-${localKey}` : undefined}
                                  className={`w-full cursor-text rounded-lg border-2 bg-white px-3 py-2 text-center text-xl font-bold tabular-nums caret-indigo-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${fieldError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}`}
                                />

                                {t.isAssigned && (
                                  <button
                                    type="button"
                                    onClick={() => setShowNotes(prev => ({ ...prev, [localKey]: !prev[localKey] }))}
                                    className="mt-1.5 text-xs font-medium text-slate-500 hover:text-indigo-700"
                                  >
                                    {showNotes[localKey] ? '− hide note' : '+ note'}
                                  </button>
                                )}

                                {showNotes[localKey] && (
                                  <input
                                    type="text"
                                    placeholder="Optional note"
                                    value={notes[localKey] || ''}
                                    onChange={e => setNotes(prev => ({ ...prev, [localKey]: e.target.value }))}
                                    onBlur={() => applyScore(t.team_id, c, localKey)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' || e.key === 'Tab') {
                                        e.preventDefault()
                                        e.currentTarget.blur()
                                        stepScore(localKey, e.key === 'Tab' && e.shiftKey ? -1 : 1)
                                      }
                                    }}
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
                                  />
                                )}

                                <p className="mt-1.5 h-4 text-xs">
                                  {fieldError ? (
                                    <span id={`err-${localKey}`} className="font-medium text-red-600">{fieldError}</span>
                                  ) : fieldStatus === 'saving' ? (
                                    <span className="text-slate-400">saving...</span>
                                  ) : fieldStatus === 'saved' ? (
                                    <span className="font-semibold text-emerald-600">saved</span>
                                  ) : null}
                                </p>
                              </div>
                            )
                          })}
                        </div>
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
