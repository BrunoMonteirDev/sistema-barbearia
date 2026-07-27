import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postgres } from '@/lib/postgres'
import { Funcionario } from './funcionarios.types'

interface Props {
    abrir: boolean
    funcionario: Funcionario | null
    fechar: () => void
    atualizarLista: () => Promise<void>
}

export default function EditarFuncionarioModal({
    abrir,
    funcionario,
    fechar,
    atualizarLista,
}: Props) {
    const [nome, setNome] = useState('')
    const [fotoPreview, setFotoPreview] = useState<string | null>(null)
    const [arquivo, setArquivo] = useState<File | null>(null)
    const [salvando, setSalvando] = useState(false)

    // Carregar dados iniciais
    useEffect(() => {
        if (!funcionario) return

        console.log("ðŸ”„ Modal abriu com funcionÃ¡rio:", funcionario)

        setNome(funcionario.usuario.nome || '')
        setFotoPreview(funcionario.usuario?.foto || null)
        setArquivo(null)
    }, [funcionario])

    if (!abrir || !funcionario) return null

    function aoSelecionarImagem(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        console.log("ðŸ“¸ Imagem selecionada:", file)

        setArquivo(file)
        setFotoPreview(URL.createObjectURL(file))
    }

    async function salvar() {
        if (!funcionario) return

        console.log("â–¶ï¸ Iniciando salvar()...")
        console.log("ðŸ“¦ Dados do form:", { nome, arquivo })
        console.log("ðŸ†” ID do usuÃ¡rio:", funcionario.usuario_id)

        try {
            setSalvando(true)

            let fotoUrl = funcionario.usuario?.foto || null

            // =====================================================
            // 1) UPLOAD DA IMAGEM NO STORAGE
            // =====================================================
            if (arquivo) {
                console.log("â¬†ï¸ Enviando nova imagem para o Storage...")

                const nomeArquivo = `${funcionario.usuario_id}-${Date.now()}`

                const { data: uploaded, error: uploadError } = await postgres.storage
                    .from('avatars')
                    .upload(nomeArquivo, arquivo, { upsert: true })

                console.log("ðŸ“¤ Resultado upload:", uploaded, uploadError)

                if (uploadError) {
                    console.error("âŒ Erro no upload:", uploadError)
                    toast.error('Erro ao subir imagem')
                    setSalvando(false)
                    return
                }

                const { data: publicUrl } = postgres.storage
                    .from('avatars')
                    .getPublicUrl(nomeArquivo)

                console.log("ðŸŒ URL pÃºblica gerada:", publicUrl)

                fotoUrl = publicUrl.publicUrl
            }

            // =====================================================
            // 2) ATUALIZAR NA TABELA USUÃRIOS
            // =====================================================
            console.log("ðŸ“ Atualizando tabela usuarios...")
            console.log("âž¡ï¸ Enviando update:", {
                id: funcionario.usuario_id,
                nome,
                foto: fotoUrl,
            })

            const { data: updated, error } = await postgres
                .from('usuarios')
                .update({
                    nome,
                    foto: fotoUrl,
                })
                .eq('id', funcionario.usuario_id)
                .select()

            console.log("ðŸ§¾ Retorno UPDATE usuarios:")
            console.log("ðŸ”¹ data:", updated)
            console.log("ðŸ”¹ error:", error)

            if (error) {
                console.error("âŒ Erro ao atualizar usuÃ¡rio:", error)
                toast.error('Erro ao atualizar funcionÃ¡rio')
                setSalvando(false)
                return
            }

            toast.success('FuncionÃ¡rio atualizado com sucesso!')
            console.log("âœ… AtualizaÃ§Ã£o finalizada com sucesso")

            await atualizarLista()
            fechar()

        } catch (err) {
            console.error("ðŸ’¥ ERRO GERAL NO TRY/CATCH:", err)
            toast.error('Erro ao salvar')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">

                <h3 className="text-lg font-semibold">
                    Editar funcionÃ¡rio: {funcionario.usuario.nome}
                </h3>

                {/* PREVIEW */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {fotoPreview ? (
                            <img
                                src={fotoPreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs text-gray-500">Sem foto</span>
                        )}
                    </div>
                </div>

                {/* NOME */}
                <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>

                {/* UPLOAD */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Foto (opcional)
                    </label>

                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm cursor-pointer">
                        Escolher imagem
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={aoSelecionarImagem}
                        />
                    </label>

                    {arquivo && (
                        <p className="text-xs text-gray-500 mt-1">{arquivo.name}</p>
                    )}
                </div>

                {/* BOTÃ•ES */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={fechar}
                        className="px-4 py-2 rounded-lg border"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={salvar}
                        disabled={salvando}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                        {salvando ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

