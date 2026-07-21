import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Quant render failure', error, info)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <section className="pixel-panel max-w-lg p-6 text-center" role="alert">
          <h1 className="font-pixel text-sm uppercase text-[#bfe3d0]">Quant needs a quick reset</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The world could not render, but no wallet action or transaction was attempted.
          </p>
          <button className="pixel-btn mt-5 border-[#1d6b63] bg-[#2fa4a8] px-5 py-3 text-[#06282a]" onClick={() => window.location.reload()}>
            Reload world
          </button>
        </section>
      </main>
    )
  }
}
