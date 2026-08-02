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
import CompleteRegistrationPage from '@/pages/user/CompleteRegistrationPage'
import { AcessibilidadeControls } from '@/components/AcessibilidadeControls'
import { VLibras } from '@/components/VLibras'
import { KeyboardArrowNavigation } from '@/components/KeyboardArrowNavigation'
import { CookieNotice } from '@/components/CookieNotice'
import LegalPage from '@/pages/LegalPage'

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
    <KeyboardArrowNavigation />
    <VLibras />
    <CookieNotice />
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/agendamento" component={AgendarPage} />
      <Route path="/privacidade" component={() => <LegalPage kind="privacidade" />} />
      <Route path="/termos" component={() => <LegalPage kind="termos" />} />
      <Route path="/cookies" component={() => <LegalPage kind="cookies" />} />
      <Route path="/painel/:rest*" component={() => <AdminRoute component={PainelPage} />} />
      <Route path="/painel" component={() => <AdminRoute component={PainelPage} />} />
      <Route path="/minha-conta/agendamentos" component={() => <UserRoute component={UserAppointmentsPage} />} />
      <Route path="/concluir-cadastro" component={CompleteRegistrationPage} />
      <Route path="/minha-conta" component={() => <UserRoute component={MinhaContaPage} />} />
      <Route>Não encontrado.</Route>
    </Switch>
  </AuthProvider>
}
