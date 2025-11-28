import React from 'react'
import { Link } from 'react-router-dom'
import './../styles.css'
export default function NotFound() {
  return (
    <div className="container flex flex-col gap-4 justify-center items-center min-h-screen">
      <h2>404 — Not Found</h2>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link className="btn" to="/">Go Home</Link>
    </div>
  )
}
