import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { postgres } from '@/lib/postgres'

interface Produto {
  id: string
  nome: string
  descricao: string | null
  preco: number
  estoque: number
  estoque_minimo: number
  ativo: boolean
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '0',
    estoque_minimo: '5',
    ativo: true
  })

  useEffect(() => {
    fetchProdutos()
  }, [])

  async function fetchProdutos() {
    const { data, error } = await postgres
      .from('produtos')
      .select('*')
      .order('nome')

    if (!error && data) {
      setProdutos(data)
    }
    setLoading(false)
  }

  const filteredProdutos = produtos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  )

  function openModal(produto?: Produto) {
    if (produto) {
      setEditingProduto(produto)
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || '',
        preco: produto.preco.toString(),
        estoque: produto.estoque.toString(),
        estoque_minimo: produto.estoque_minimo.toString(),
        ativo: produto.ativo
      })
    } else {
      setEditingProduto(null)
      setFormData({ nome: '', descricao: '', preco: '', estoque: '0', estoque_minimo: '5', ativo: true })
    }
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const data = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque),
        estoque_minimo: parseInt(formData.estoque_minimo),
        ativo: formData.ativo
      }

      if (editingProduto) {
        const { error } = await postgres
          .from('produtos')
          .update(data)
          .eq('id', editingProduto.id)

        if (error) throw error
        toast.success('Produto atualizado com sucesso!')
      } else {
        const { error } = await postgres.from('produtos').insert(data)
        if (error) throw error
        toast.success('Produto criado com sucesso!')
      }

      setShowModal(false)
      fetchProdutos()
    } catch (error) {
      toast.error('Erro ao salvar produto')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const { error } = await postgres.from('produtos').delete().eq('id', id)
      if (error) throw error
      toast.success('Produto excluido com sucesso!')
      fetchProdutos()
    } catch (error) {
      toast.error('Erro ao excluir produto')
    }
  }

  const defaultProdutos = [
    { id: '1', nome: 'Pomada Modeladora', descricao: 'Pomada para cabelo com fixacao forte', preco: 45, estoque: 15, estoque_minimo: 5, ativo: true },
    { id: '2', nome: 'Oleo para Barba', descricao: 'Oleo hidratante para barba', preco: 55, estoque: 8, estoque_minimo: 3, ativo: true },
    { id: '3', nome: 'Shampoo Especial', descricao: 'Shampoo para cabelos masculinos', preco: 35, estoque: 2, estoque_minimo: 5, ativo: true },
    { id: '4', nome: 'Balm para Barba', descricao: 'Balm hidratante e modelador', preco: 40, estoque: 0, estoque_minimo: 3, ativo: false },
  ]

  const displayProdutos = produtos.length > 0 ? filteredProdutos : defaultProdutos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Novo Produto
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Produto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Preco</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Estoque</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayProdutos.map((produto) => (
                  <tr key={produto.id} className={`hover:bg-gray-50 ${!produto.ativo ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-secondary-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{produto.nome}</p>
                          <p className="text-sm text-gray-500">{produto.descricao || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary-500">
                        R$ {produto.preco.toFixed(2).replace('.', ',')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${produto.estoque <= produto.estoque_minimo ? 'text-red-600' : 'text-gray-800'}`}>
                          {produto.estoque}
                        </span>
                        {produto.estoque <= produto.estoque_minimo && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        produto.ativo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(produto)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(produto.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-secondary-500 mb-6">
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Descricao</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Preco (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Estoque</label>
                  <input
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Min.</label>
                  <input
                    type="number"
                    value={formData.estoque_minimo}
                    onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-primary-500"
                />
                <label htmlFor="ativo" className="text-gray-700">Produto ativo</label>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

