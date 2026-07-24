import { useEffect, useState } from 'react'
import Header from '../components/Header'
import BookCard from '../components/BookCard'
import BookForm from '../components/BookForm'
import { useBooks } from '../hooks/useBooks'

export default function Home() {
  const {
    books,
    search,
    page,
    pageSize,
    totalCount,
    realtimeStatus,
    getBooks,
    searchBooks,
    nextPage,
    prevPage,
    addBook,
    updateBook,
    deleteBook,
  } = useBooks()

  const [editingBook, setEditingBook] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    getBooks()
  }, [])

  function handleAddClick() {
    setEditingBook(null)
    setShowForm(true)
  }

  function handleEdit(book) {
    setEditingBook(book)
    setShowForm(true)
  }

  async function handleDelete(id) {
    await deleteBook(id)
  }

  async function handleSave(bookData) {
    let result = null

    if (editingBook) {
      result = await updateBook(editingBook.id, bookData)
    } else {
      result = await addBook(bookData)
    }

    if (result) {
      setShowForm(false)
      setEditingBook(null)
    }
  }

  function handleCancelForm() {
    setShowForm(false)
    setEditingBook(null)
  }

  function handleSearchChange(e) {
    searchBooks(e.target.value)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1)

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>My Books</h2>
            <p className="book-count">
              {totalCount} {totalCount === 1 ? 'book' : 'books'} found
              <span className={`realtime-badge realtime-${realtimeStatus.toLowerCase()}`}>
                Live: {realtimeStatus}
              </span>
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleAddClick}>
            + Add Book
          </button>
        </div>

        <div className="toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Search books by title..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>{search ? 'No books match your search' : 'No books yet'}</h3>
            <p>
              {search
                ? 'Try a different search term.'
                : 'Click "Add Book" to create your first one.'}
            </p>
          </div>
        ) : (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className="pagination">
          <button
            type="button"
            className="btn btn-outline"
            onClick={prevPage}
            disabled={page <= 1}
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            className="btn btn-outline"
            onClick={nextPage}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </main>

      {showForm && (
        <BookForm
          book={editingBook}
          onSave={handleSave}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  )
}
