import { CrudPage } from '@/components/admin/crud-page'
export default function ClientesPage() { return <CrudPage title="Clientes" endpoint="/api/clientes" fields={[{ key: 'nome', label: 'Nome', required: true }, { key: 'telefone', label: 'Telefone' }, { key: 'email', label: 'E-mail', type: 'email', required: true }, { key: 'dataNascimento', label: 'Data de nascimento', type: 'text' }]} /> }
