export default function BookCard({ book, onEdit, onDelete }) {
  return (
    <article className="book-card">
      <div className="book-card-image">
        {book.image ? (
          <img src={book.image} alt={book.title} />
        ) : (
          <div className="book-image-placeholder">No image</div>
        )}
      </div>

      <div className="book-card-body">
        <h2 className="book-title">{book.title}</h2>
        {book.description && (
          <p className="book-description">{book.description}</p>
        )}
      </div>

      <div className="book-card-actions">
        <button
          type="button"
          className="btn btn-edit"
          onClick={() => onEdit(book)}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-delete"
          onClick={() => onDelete(book.id)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
