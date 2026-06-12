import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: '#064e3b',
              color: '#6ee7b7',
              border: '1px solid #065f46',
            },
            iconTheme: {
              primary: '#34d399',
              secondary: '#064e3b',
            },
          },
          error: {
            style: {
              background: '#881337',
              color: '#fda4af',
              border: '1px solid #9f1239',
            },
            iconTheme: {
              primary: '#fb7185',
              secondary: '#881337',
            },
          },
        }}
      />
    </>
  )
}

export default App
