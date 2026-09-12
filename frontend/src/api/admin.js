import api from './client'

export const listUsers = () => api.get('/admin/users').then(r => r.data)
export const createUser = (email, password, role) => api.post('/admin/users', null, { params: { email, password, role } }).then(r => r.data)
export const listAuditLogs = () => api.get('/admin/audit-logs').then(r => r.data)
export const getTeamSubmissionsForAdmin = (teamId) => api.get(`/admin/teams/${teamId}/submissions`).then(r => r.data)
export const reopenSubmissionAdmin = (submissionId, reason) => api.post(`/admin/submissions/${submissionId}/reopen`, { reason }).then(r => r.data)
export const removeSubmissionFileAdmin = (submissionId, fileId, reason) => api.delete(`/admin/submissions/${submissionId}/files/${fileId}`, { data: { reason } }).then(r => r.data)
