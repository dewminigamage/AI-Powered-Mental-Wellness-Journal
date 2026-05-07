export default function AlertMessage({ type = 'danger', message, onClose }) {
  if (!message) return null
  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      <i className={`bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
      {message}
      {onClose && <button type="button" className="btn-close" onClick={onClose}></button>}
    </div>
  )
}
