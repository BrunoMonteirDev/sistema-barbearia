import { CrudPage } from '@/components/admin/crud-page'
export default function ServicosPage() { return <CrudPage title="Serviços" endpoint="/api/servicos" fields={[{ key: 'nome', label: 'Nome', required: true }, { key: 'duracao', label: 'Duração (min)', type: 'number', required: true }, { key: 'preco', label: 'Valor', type: 'number', required: true }]} /> }
