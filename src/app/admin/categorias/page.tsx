'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  order: number
  _count?: { products: number }
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  async function createCategory() {
    if (!newName.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories((prev) => [...prev, cat])
      setNewName('')
    }
    setSaving(false)
  }

  async function updateCategory(id: string) {
    if (!editName.trim()) return
    setSaving(true)
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditId(null)
    }
    setSaving(false)
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`¿Eliminar categoría "${name}"? Los productos quedarán sin categoría.`)) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="skeleton h-8 w-48 mb-4 rounded-[2px]" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-[2px]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-tight">Categorías</h1>
        <p className="text-[#888888] text-sm mt-1">{categories.length} categorías</p>
      </div>

      {/* Crear nueva */}
      <div className="card p-5 mb-6">
        <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-3">
          Nueva categoría
        </h2>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createCategory()}
            placeholder="Nombre de la categoría"
            className="input flex-1"
          />
          <button
            onClick={createCategory}
            disabled={saving || !newName.trim()}
            className="btn-primary px-4 disabled:opacity-40"
          >
            <Plus size={16} />
            Crear
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="border border-[#222222] rounded-[2px] overflow-hidden">
        <div className="divide-y divide-[#222222]">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#111111] transition-colors">
              <GripVertical size={14} className="text-[#555555] cursor-grab flex-shrink-0" />

              {editId === cat.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateCategory(cat.id)
                    if (e.key === 'Escape') setEditId(null)
                  }}
                  className="input flex-1 text-sm py-1.5"
                  autoFocus
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#FAFAFA]">{cat.name}</p>
                  <p className="text-[11px] text-[#555555] font-display">/categorias/{cat.slug}</p>
                </div>
              )}

              <div className="flex items-center gap-1 flex-shrink-0">
                {editId === cat.id ? (
                  <>
                    <button
                      onClick={() => updateCategory(cat.id)}
                      className="btn-primary text-xs py-1.5 px-3"
                      disabled={saving}
                    >
                      Guardar
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-ghost text-xs py-1.5 px-3">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditId(cat.id); setEditName(cat.name) }}
                      className="btn-ghost p-2"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      className="btn-ghost p-2 hover:text-[#E53E3E]"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="py-12 text-center text-[#555555] font-display text-xs uppercase tracking-widest">
            Sin categorías
          </div>
        )}
      </div>
    </div>
  )
}
