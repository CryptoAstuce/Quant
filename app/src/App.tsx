import { Route, Routes } from 'react-router'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/chain/wagmi'
import Landing from '@/pages/Landing'
import Settlement from '@/pages/Settlement'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
})

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/demo" element={<Settlement mode="demo" />} />
          <Route path="/world" element={<Settlement mode="live" />} />
        </Routes>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
