import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: [
      'src/App.tsx',
      'src/main.tsx',
      'src/lib/api.ts',
      'src/contexts/AuthContext.tsx',
      'src/components/ProtectedRoute.tsx',
      'src/components/ui/modal.tsx',
      'src/pages/HomePage.tsx',
      'src/pages/LoginPage.tsx',
      'src/pages/PainelPage.tsx',
      'src/pages/agendar/AgendarPage.tsx',
      'src/pages/user/MinhaContaPage.tsx',
      'src/pages/painel/ClientesPage.tsx',
      'src/pages/painel/AgendamentosPage.tsx',
      'src/pages/painel/FuncionariosPage.tsx',
      'src/pages/painel/ServicosAdminPage.tsx',
    ],
    languageOptions: { parser: tseslint.parser },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-irregular-whitespace': 'error',
      'prefer-const': 'error',
    },
  },
]
