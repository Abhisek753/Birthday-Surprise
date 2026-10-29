import { Component } from 'react'

// If a chapter ever crashes, show a friendly card instead of a frozen screen
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="stack">
        <h1 className="title small">Oops, a star slipped 🌠</h1>
        <p className="subtitle">Something went wrong on this page.</p>
        <div className="row">
          <button className="btn ghost" onClick={() => this.setState({ failed: false })}>
            ↻ Try again
          </button>
          <button className="btn" onClick={this.props.onSkip}>
            Skip →
          </button>
        </div>
      </div>
    )
  }
}
