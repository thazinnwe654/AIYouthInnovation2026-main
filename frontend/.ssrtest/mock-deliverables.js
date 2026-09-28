// Stand-in for src/api/deliverables.js
import { loadFixtures } from './fixtures.mjs'

let F = null
const fixtures = async () => (F ||= await loadFixtures())

export const getCompetitionSubmissions = async () => (await fixtures()).submissions
export const downloadFile = async () => {}
export const downloadTeamZip = async () => {}
