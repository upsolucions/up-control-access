declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react'

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number
    absoluteStrokeWidth?: boolean
  }

  export type LucideIcon = ComponentType<LucideProps>

  // Exportar todos os ícones usados no projeto
  export const Shield: LucideIcon
  export const Users: LucideIcon
  export const Building: LucideIcon
  export const Eye: LucideIcon
  export const Smartphone: LucideIcon
  export const Building2: LucideIcon
  export const FileText: LucideIcon
  export const Network: LucideIcon
  export const Search: LucideIcon
  export const Settings: LucideIcon
  export const Wrench: LucideIcon
  export const AlertTriangle: LucideIcon
  export const Globe: LucideIcon
  export const Mail: LucideIcon
  export const Plus: LucideIcon
  export const Edit: LucideIcon
  export const Trash2: LucideIcon
  export const Save: LucideIcon
  export const RefreshCw: LucideIcon
  export const Download: LucideIcon
  export const Send: LucideIcon
  export const CheckCircle: LucideIcon
  export const Camera: LucideIcon
  export const Router: LucideIcon
  export const Monitor: LucideIcon
  export const Laptop: LucideIcon
  export const Printer: LucideIcon
  export const Server: LucideIcon
  export const MessageCircle: LucideIcon
  export const Phone: LucideIcon
  export const Clock: LucideIcon
  export const MapPin: LucideIcon
  export const Wifi: LucideIcon
  export const Zap: LucideIcon
  export const Car: LucideIcon
  export const Flame: LucideIcon
  export const User: LucideIcon
  export const LogOut: LucideIcon
  export const X: LucideIcon
  export const Check: LucideIcon
  export const ChevronDown: LucideIcon
  export const ChevronUp: LucideIcon
  export const ChevronLeft: LucideIcon
  export const ChevronRight: LucideIcon
  export const Home: LucideIcon
  export const Calendar: LucideIcon
  export const Filter: LucideIcon
  export const MoreHorizontal: LucideIcon
  export const ExternalLink: LucideIcon
  export const Copy: LucideIcon
  export const Upload: LucideIcon
  export const Image: LucideIcon
  export const Trash: LucideIcon
  export const Info: LucideIcon
  export const Warning: LucideIcon
  export const Error: LucideIcon
  export const Success: LucideIcon
  export const Loading: LucideIcon
  export const ArrowLeft: LucideIcon
  export const ArrowRight: LucideIcon
  export const ArrowUp: LucideIcon
  export const ArrowDown: LucideIcon
}