import SupabaseDiagnostic from '../../components/SupabaseDiagnostic'

export default function SupabaseDiagnosticPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Diagnóstico do Supabase</h1>
          <p className="text-muted-foreground">
            Esta página permite verificar a conectividade e configuração do banco de dados Supabase.
          </p>
        </div>
        
        <SupabaseDiagnostic />
        
        <div className="mt-8 p-4 bg-gray-50 border rounded-lg">
          <h3 className="font-medium mb-2">🔗 Links Úteis</h3>
          <ul className="text-sm space-y-1">
            <li>• <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Painel do Supabase</a></li>
            <li>• <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Documentação</a></li>
            <li>• <a href="/" className="text-blue-600 hover:underline">Voltar ao Sistema</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}