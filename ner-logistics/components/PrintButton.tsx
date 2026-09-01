"use client"

import { Printer } from "lucide-react"

interface PrintButtonProps {
  label?: string
  className?: string
}

export default function PrintButton({ label = "Print / Save PDF", className }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className={
        className ||
        "flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
      }
    >
      <Printer className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}
