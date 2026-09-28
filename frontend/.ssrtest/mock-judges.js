// Stand-in for src/api/judges.js, backed by the live API.
import { loadFixtures } from './fixtures.mjs'

let F = null
const fixtures = async () => (F ||= await loadFixtures())

// Surface the real failure instead of the component's generic message.
const guarded = async (name, fn) => {
  try {
    const v = await fn()
    console.log(`  [mock] ${name} -> ${Array.isArray(v) ? `array[${v.length}]` : typeof v}`)
    return v
  } catch (err) {
    console.log(`  [mock] ${name} FAILED -> ${err && err.message}`)
    throw err
  }
}

export const listMyAssignments = async () => (await guarded('/judges/my-assignments', () => fixtures().then(f => f.assignments)))
export const getCriteria = async () => (await guarded('/judges/evaluations/criteria', () => fixtures().then(f => f.criteria)))
export const getSubmittedTeams = async () => (await guarded('/judges/submitted-teams', () => fixtures().then(f => f.submittedTeams)))
export const getJudgeAllSubmissions = async () => (await guarded('/judges/submissions', () => fixtures().then(f => f.submissions)))
export const listMyEvaluations = async () => (await guarded('/judges/evaluations', () => fixtures().then(f => f.evaluations)))
export const getCompetitionSubmissions = async () => (await fixtures()).submissions
export const getCompetitionScores = async () => []
export const createMyEvaluation = async () => ({ id: 999 })
export const addScore = async () => ({})
export const clearEvaluation = async () => ({})
