import { useEffect, useState } from 'react'

const EMPTY_FORM = {
  title: '',
  description: '',
}

export default function BookForm({ book, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(book)

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        description: book.description || '',
      })
      setPreview(book.image || '')
    } else {
      setForm(EMPTY_FORM)
      setPreview('')
    }
    setImageFile(null)
    setError('')
  }, [book])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    setError('')
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }

    setLoading(true)
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        imageFile, // File object — upload happens in useBooks
        existingImage: book?.image || '',
      })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>

        <form onSubmit={handleSubmit} className="book-form">
          <label>
            Title *
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Book title"
              disabled={loading}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short summary..."
              rows={3}
              disabled={loading}
            />
          </label>

          <label>
            Banner image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
