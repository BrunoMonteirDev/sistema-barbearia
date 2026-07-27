import { CrudPage } from '@/components/admin/crud-page'
export default function ProfissionaisPage() { return <CrudPage title="Profissionais" endpoint="/api/profissionais" fields={[{ key: 'nome', label: 'Nome', required: true }, { key: 'especialidade', label: 'Especialidade' }]} /> }
