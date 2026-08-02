import { Route, Switch } from 'wouter'
import { Toaster, ToastBar, toast } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminRoute, UserRoute } from '@/components/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import AgendarPage from '@/pages/agendar/AgendarPage'
import PainelPage from '@/pages/PainelPage'
import MinhaContaPage from '@/pages/user/MinhaContaPage'
import UserAppointmentsPage from '@/pages/user/UserAppointmentsPage'
import { AcessibilidadeControls } from '@/components/AcessibilidadeControls'

export default function App() {
  return <AuthProvider>
    <Toaster position="top-center" toastOptions={{ duration: 1000 }}>
      {(currentToast) => <ToastBar toast={currentToast}>
        {({ icon, message }) => <>
          {icon}
          {message}
          <button
            type="button"
            aria-label="Fechar notificação"
            className="ml-2 rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            onClick={() => toast.dismiss(currentToast.id)}
          >
            ×
          </button>
        </>}
      </ToastBar>}
    </Toaster>
    <AcessibilidadeControls />
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/agendamento" component={AgendarPage} />
      <Route path="/painel/:rest*" component={() => <AdminRoute component={PainelPage} />} />
      <Route path="/painel" component={() => <AdminRoute component={PainelPage} />} />
      <Route path="/minha-conta/agendamentos" component={() => <UserRoute component={UserAppointmentsPage} />} />
      <Route path="/minha-conta" component={() => <UserRoute component={MinhaContaPage} />} />
      <Route>Não encontrado.</Route>
    </Switch>
  </AuthProvider>
}
