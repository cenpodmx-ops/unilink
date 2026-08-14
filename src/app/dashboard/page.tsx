import { Dashboard } from '@/components/dashboard/dashboard'

export default function DashboardPage() {
  // En producción, esto vendría del auth del usuario logueado.
  // Por ahora mostramos el negocio demo.
  return <Dashboard slug="studio-fernanda" />
}
