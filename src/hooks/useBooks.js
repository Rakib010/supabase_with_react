import { useState } from 'react'
import { supabase } from '../utils/supabase'

export function useBooks() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(6)
  const [totalCount, setTotalCount] = useState(0)

  async function getCurrentUserId() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user.id
  }

  // GET with search + pagination
  async function getBooks(options = {}) {
    const currentPage = options.page ?? page
    const currentSearch = options.search ?? search

    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('id', { ascending: false })

    const term = currentSearch.trim()
    if (term) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching books:', error)
      return []
    }

    setBooks(data ?? [])
    setTotalCount(count ?? 0)
    setPage(currentPage)
    setSearch(currentSearch)

    return data ?? []
  }

  async function searchBooks(query) {
    await getBooks({ page: 1, search: query })
  }

  async function goToPage(nextPage) {
    if (nextPage < 1) return
    await getBooks({ page: nextPage })
  }

  function nextPage() {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    if (page < totalPages) {
      goToPage(page + 1)
    }
  }

  function prevPage() {
    if (page > 1) {
      goToPage(page - 1)
    }
  }

  // CREATE — RLS: auth.uid() = user_id
  async function addBook(bookData) {
    const userId = await getCurrentUserId()

    if (!userId) {
      console.error('Error adding book: user not logged in')
      alert('Please login first to add a book.')
      return null
    }

    const newBook = {
      title: bookData.title,
      description: bookData.description,
      image: bookData.image,
      user_id: userId,
    }

    const { error } = await supabase.from('tasks').insert([newBook])

    if (error) {
      console.error('Error adding book:', error)
      alert(error.message)
      return null
    }

    await getBooks({ page: 1 })
    return newBook
  }

  // UPDATE
  async function updateBook(id, bookData) {
    const userId = await getCurrentUserId()

    if (!userId) {
      alert('Please login first to edit a book.')
      return null
    }

    const updatedBook = {
      title: bookData.title,
      description: bookData.description,
      image: bookData.image,
    }

    const { error } = await supabase
      .from('tasks')
      .update(updatedBook)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating book:', error)
      alert(error.message)
      return null
    }

    await getBooks()
    return updatedBook
  }

  // DELETE
  async function deleteBook(id) {
    const userId = await getCurrentUserId()

    if (!userId) {
      alert('Please login first to delete a book.')
      return null
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting book:', error)
      alert(error.message)
      return null
    }

    const remaining = totalCount - 1
    const totalPages = Math.max(1, Math.ceil(remaining / pageSize))
    const next = Math.min(page, totalPages)

    await getBooks({ page: next })
  }

  return {
    books,
    search,
    page,
    pageSize,
    totalCount,
    getBooks,
    searchBooks,
    goToPage,
    nextPage,
    prevPage,
    addBook,
    updateBook,
    deleteBook,
  }
}
