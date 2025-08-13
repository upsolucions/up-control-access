import { supabase } from './supabase'

// Função para testar a conectividade com o Supabase
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Teste 1: Verificar se o cliente está configurado
    console.log('📡 URL do Supabase:', supabase.supabaseUrl)
    
    // Teste 2: Tentar fazer uma consulta simples
    const { data, error } = await supabase
      .from('usuarios')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Erro na consulta:', error)
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error }
    }
    
    console.log('✅ Conexão com Supabase estabelecida!')
    console.log('📊 Número de usuários na tabela:', data)
    
    return { success: true, data }
  } catch (err) {
    console.error('💥 Erro inesperado:', err)
    return { success: false, error: err }
  }
}

// Função para listar todas as tabelas disponíveis
export async function listTables() {
  try {
    console.log('📋 Listando tabelas disponíveis...')
    
    const { data, error } = await supabase
      .rpc('get_schema_tables')
    
    if (error) {
      console.error('❌ Erro ao listar tabelas:', error)
      return { success: false, error }
    }
    
    console.log('📊 Tabelas encontradas:', data)
    return { success: true, data }
  } catch (err) {
    console.error('💥 Erro inesperado ao listar tabelas:', err)
    return { success: false, error: err }
  }
}

// Função para verificar se uma tabela específica existe
export async function checkTableExists(tableName: string) {
  try {
    console.log(`🔍 Verificando se a tabela '${tableName}' existe...`)
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log(`❌ Tabela '${tableName}' não existe`)
        return { exists: false, error }
      }
      console.error(`❌ Erro ao verificar tabela '${tableName}':`, error)
      return { exists: false, error }
    }
    
    console.log(`✅ Tabela '${tableName}' existe e está acessível`)
    return { exists: true, data }
  } catch (err) {
    console.error(`💥 Erro inesperado ao verificar tabela '${tableName}':`, err)
    return { exists: false, error: err }
  }
}

// Função para executar todos os testes
export async function runAllTests() {
  console.log('🚀 Iniciando testes do Supabase...')
  
  // Teste de conexão
  const connectionTest = await testSupabaseConnection()
  
  // Teste de tabelas
  const tables = ['usuarios', 'condominios', 'pessoas', 'logos', 'sessoes']
  const tableTests = await Promise.all(
    tables.map(table => checkTableExists(table))
  )
  
  console.log('📊 Resumo dos testes:')
  console.log('- Conexão:', connectionTest.success ? '✅' : '❌')
  
  tables.forEach((table, index) => {
    console.log(`- Tabela ${table}:`, tableTests[index].exists ? '✅' : '❌')
  })
  
  return {
    connection: connectionTest,
    tables: tableTests
  }
}