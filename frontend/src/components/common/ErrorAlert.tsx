import { extractApiError } from '../../services/api'

interface ErrorAlertProps { error: unknown }

export function ErrorAlert({ error }: ErrorAlertProps) {
  const apiErr = extractApiError(error)
  return (
    <div className="alert alert-danger" role="alert">
      {apiErr.message ?? 'An unexpected error occurred.'}
    </div>
  )
}
