import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTeam } from '../api/teams'
import { getTeamSubmissionsForAdmin, reopenSubmissionAdmin, removeSubmissionFileAdmin } from '../api/admin'

export default function TeamDetail() {
  const { id } = useParams()
  const [team, setTeam] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [removing, setRemoving] = useState({})
  const [reopening, setReopening] = useState({})
  const [error, setError] = useState('')

  const loadTeam = async () => {
    const teamData = await getTeam(id)
    setTeam(teamData)
    const submissionsData = await getTeamSubmissionsForAdmin(id)
    setSubmissions(submissionsData)
  }

  useEffect(() => { loadTeam().catch(() => setError('Failed to load team details')) }, [id])

  const handleRemoveFile = async (submissionId, fileId) => {
    const reason = window.prompt('Reason for removing this file from the submission:')
    if (!reason || !reason.trim()) return
    setRemoving(prev => ({ ...prev, [fileId]: true }))
    try {
      await removeSubmissionFileAdmin(submissionId, fileId, reason)
      await loadTeam()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove file')
    } finally {
      setRemoving(prev => ({ ...prev, [fileId]: false }))
    }
  }

  const handleReopenSubmission = async (submissionId) => {
    const reason = window.prompt('Reason for requiring a replacement file:')
    if (!reason || !reason.trim()) return
    setReopening(prev => ({ ...prev, [submissionId]: true }))
    try {
      await reopenSubmissionAdmin(submissionId, reason)
      await loadTeam()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reopen submission')
    } finally {
      setReopening(prev => ({ ...prev, [submissionId]: false }))
    }
  }

  if (!team) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/teams" className="text-indigo-600 hover:underline">&larr; Back to Teams</Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">{team.name}</h1>
      <p className="text-gray-500 mb-6">Competition ID: {team.competition_id}</p>

      {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <h2 className="text-xl font-semibold mb-4">Members ({team.members?.length || 0})</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead className="bg-gray-50"><tr><th className="p-3">User ID</th><th className="p-3">Email</th><th className="p-3">Role</th></tr></thead>
          <tbody>{(team.members || []).map(m => (
            <tr key={m.id} className="border-t">
              <td className="p-3">{m.user_id}</td>
              <td className="p-3">{m.email}</td>
              <td className="p-3">{m.is_leader ? <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Leader</span> : 'Member'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mb-4">Submission Files</h2>
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-gray-500">No submissions found for this team.</div>
        ) : submissions.map(submission => (
          <div key={submission.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-semibold">{submission.deliverable_name || 'Deliverable ' + submission.deliverable_id}</div>
                <div className="text-xs text-gray-500">Status: {submission.status} · Version: {submission.version}</div>
              </div>
              {(submission.status === 'SUBMITTED' || submission.status === 'LOCKED') && (
                <button
                  type="button"
                  disabled={reopening[submission.id]}
                  onClick={() => handleReopenSubmission(submission.id)}
                  className="px-3 py-1 text-sm rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {reopening[submission.id] ? 'Reopening...' : 'Require replacement'}
                </button>
              )}
            </div>
            {submission.files.length === 0 ? (
              <div className="text-sm text-gray-500">No files uploaded for this submission.</div>
            ) : (
              <div className="space-y-2">
                {submission.files.map(file => (
                  <div key={file.id} className="flex items-center justify-between gap-3 border rounded p-2">
                    <div>
                      <div className="font-medium">{file.original_filename}</div>
                      <div className="text-xs text-gray-500">{file.file_type || 'unknown'} · {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'size unknown'}</div>
                    </div>
                    <button
                      type="button"
                      disabled={removing[file.id]}
                      onClick={() => handleRemoveFile(submission.id, file.id)}
                      className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {removing[file.id] ? 'Removing...' : 'Remove file'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
