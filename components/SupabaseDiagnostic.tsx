'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Server } from 'lucide-react'
import { runAllTests, testSupabaseConnection, checkTableExists } from '../lib/supabase-test'
import { supabase } from '../lib/supabase'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: any
}

export default function SupabaseDiagnostic() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<Date | null>(null)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setTests([])

    const newTests: TestResult[] = []

    // Teste 1: Configuração do cliente
    newTests.push({
      name: 'Configuração do Cliente',
      status: 'loading',
      message: 'Verificando configuração...'
    })
    setTests([...newTests])

    try {
      const url = supabase.supabaseUrl
      const key = supabase.supabaseKey
      
      newTests[0] = {
        name: 'Configuração do Cliente',
        status: url && key ? 'success' : 'error',
        message: url && key ? `Conectado a: ${url}` : 'URL ou chave não configuradas',
        details: { url, hasKey: !!key }
      }
    } catch (err) {
      newTests[0] = {
        name: 'Configuração do Cliente',
        status: 'error',
        message: 'Erro na configuração do cliente',
        details: err
      }
    }
    setTests([...newTests])

    // Teste 2: Conectividade
    newTests.push({
      name: 'Conectividade',
      status: 'loading',
      message: 'Testando conexão...'
    })
    setTests([...newTests])

    const connectionResult = await testSupabaseConnection()
    newTests[1] = {
      name: 'Conectividade',
      status: connectionResult.success ? 'success' : 'error',
      message: connectionResult.success ? 'Conexão estabelecida' : 'Falha na conexão',
      details: connectionResult
    }
    setTests([...newTests])

    // Teste 3: Tabelas
    const tables = ['condominios', 'usuarios', 'pessoas', 'logos', 'sessoes']
    
    for (const table of tables) {
      newTests.push({
        name: `Tabela: ${table}`,
        status: 'loading',
        message: 'Verificando...'
      })
      setTests([...newTests])

      const tableResult = await checkTableExists(table)
      const lastIndex = newTests.length - 1
      
      newTests[lastIndex] = {
        name: `Tabela: ${table}`,
        status: tableResult.exists ? 'success' : 'error',
        message: tableResult.exists ? 'Existe e acessível' : 'Não encontrada',
        details: tableResult
      }
      setTests([...newTests])
    }

    setIsRunning(false)
    setLastRun(new Date())
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      loading: 'outline'
    } as const

    return (
      <Badge variant={variants[status]}>
        {status === 'loading' ? 'Testando...' : status}
      </Badge>
    )
  }

  const hasErrors = tests.some(test => test.status === 'error')
  const allSuccess = tests.length > 0 && tests.every(test => test.status === 'success')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Diagnóstico do Supabase</CardTitle>
            </div>
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRunning ? 'Testando...' : 'Executar Testes'}
            </Button>
          </div>
          <CardDescription>
            Verificação da conectividade e configuração do banco de dados
            {lastRun && (
              <span className="block text-xs text-muted-foreground mt-1">
                Última execução: {lastRun.toLocaleString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Geral */}
          {tests.length > 0 && (
            <div className="mb-6">
              {allSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Todos os testes passaram! O Supabase está configurado corretamente.
                  </AlertDescription>
                </Alert>
              )}
              
              {hasErrors && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    ❌ Problemas detectados. Verifique as instruções em SETUP_SUPABASE.md
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Lista de Testes */}
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-muted-foreground">{test.message}</div>
                    {test.details && test.status === 'error' && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-red-600 hover:text-red-800">
                          Ver detalhes do erro
                        </summary>
                        <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>

          {/* Instruções */}
          {hasErrors && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📋 Como Resolver</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Acesse o painel do Supabase em <code>app.supabase.com</code></li>
                <li>Vá para <strong>SQL Editor</strong></li>
                <li>Execute o conteúdo do arquivo <code>database/schema.sql</code></li>
                <li>Recarregue esta página e execute os testes novamente</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}