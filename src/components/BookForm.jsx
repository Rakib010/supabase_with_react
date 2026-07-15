import { useEffect, useState } from 'react'

const EMPTY_FORM = {
  title: '',
  description: '',
  image: '',
}

export default function BookForm({ book, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const isEditing = Boolean(book)

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        description: book.description || '',
        image: book.image || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
  }, [book])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }

    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
    })
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
            />
          </label>

          <label>
            Image URL
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/book-cover.jpg"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
