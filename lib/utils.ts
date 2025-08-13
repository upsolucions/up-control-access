import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar data
export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR")
}

// Função para formatar hora
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR")
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para validar IP
export function isValidIP(ip: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipRegex.test(ip)) return false

  const parts = ip.split(".")
  return parts.every((part) => {
    const num = Number.parseInt(part)
    return num >= 0 && num <= 255
  })
}
