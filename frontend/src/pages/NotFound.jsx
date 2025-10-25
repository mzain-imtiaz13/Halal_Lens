import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container">
      <h2>404 — Not Found</h2>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link className="btn" to="/">Go Home</Link>
    </div>
  )
}
