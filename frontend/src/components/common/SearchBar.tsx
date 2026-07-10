interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search…' }: SearchBarProps) {
  return (
    <div className="input-group">
      <span className="input-group-text">🔍</span>
      <input
        type="search"
        className="form-control"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button className="btn btn-outline-secondary" type="button" onClick={() => onChange('')}>
          ✕
        </button>
      )}
    </div>
  )
}
