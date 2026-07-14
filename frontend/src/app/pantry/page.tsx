'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  Trash2,
  Edit,
  Package,
  AlertCircle,
  Filter,
  Search,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/components/Logo'
import { useAuthContext } from '@/components/AuthProvider'
import {
  usePantryStaples,
  useAddPantryStaple,
  useUpdatePantryStaple,
  useDeletePantryStaple,
  useInventory,
  useAddInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from '@/hooks/usePantry'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface PantryStaple {
  id: string
  name: string
  category: string
  default_unit: string
  default_quantity: number
  min_threshold: number
  is_staple: boolean
  notes?: string
}

interface PantryInventoryItem {
  id: string
  staple_id?: string
  name: string
  category: string
  quantity: number
  unit: string
  expires_at?: string
  location?: string
  is_open: boolean
  notes?: string
  created_at: string
  updated_at: string
}

const categories = ['produce', 'meat', 'seafood', 'dairy', 'pantry', 'spices', 'baking', 'condiments', 'beverages', 'frozen', 'other']
const units = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'pcs', 'pinch', 'dash', 'clove', 'slice', 'bunch', 'can', 'jar', 'package']
const locations = ['fridge', 'pantry', 'freezer', 'counter']

function getStatusColor(item: PantryInventoryItem): 'red' | 'amber' | 'green' | 'gray' {
  if (!item.expires_at) return 'gray'
  const daysLeft = Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'red'
  if (daysLeft <= 2) return 'amber'
  return 'green'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PantryPage() {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<'staples' | 'inventory'>('staples')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryStaple | PantryInventoryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false)

  // API hooks
  const { data: staples = [], isLoading: staplesLoading } = usePantryStaples()
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory()
  const addStapleMutation = useAddPantryStaple()
  const updateStapleMutation = useUpdatePantryStaple()
  const deleteStapleMutation = useDeletePantryStaple()
  const addInventoryMutation = useAddInventoryItem()
  const updateInventoryMutation = useUpdateInventoryItem()
  const deleteInventoryMutation = useDeleteInventoryItem()

  const [formData, setFormData] = useState({
    name: '',
    category: 'pantry',
    default_unit: 'g',
    default_quantity: 1,
    min_threshold: 0,
    quantity: 1,
    unit: 'g',
    expires_at: '',
    location: 'pantry',
  })

  const openAddStaple = () => {
    setActiveTab('staples')
    setEditingItem(null)
    setFormData({ name: '', category: 'pantry', default_unit: 'g', default_quantity: 1, min_threshold: 0, quantity: 1, unit: 'g', expires_at: '', location: 'pantry' })
    setShowAddModal(true)
  }

  const openAddInventory = () => {
    setActiveTab('inventory')
    setEditingItem(null)
    setFormData({ name: '', category: 'pantry', default_unit: 'g', default_quantity: 1, min_threshold: 0, quantity: 1, unit: 'g', expires_at: '', location: 'pantry' })
    setShowAddModal(true)
  }

  const getStatusColorStr = (item: PantryInventoryItem) => {
    if (!item.expires_at) return 'no_date'
    const daysLeft = Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return 'expired'
    if (daysLeft <= 2) return 'expiring_soon'
    return 'ok'
  }

  const filteredStaples = staples.filter(
    (s: any) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory === 'all' || s.category === filterCategory)
  )

  const filteredInventory = inventory.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesExpiring = !filterExpiringSoon || (item.expires_at && new Date(item.expires_at).getTime() - Date.now() <= 3 * 24 * 60 * 60 * 1000)
    return matchesSearch && matchesCategory && matchesExpiring
  })

  const expiringSoon = inventory.filter(
    (item: any) => item.expires_at && new Date(item.expires_at).getTime() - Date.now() <= 3 * 24 * 60 * 60 * 1000
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === 'staples') {
      if (editingItem) {
        updateStapleMutation.mutate({ id: editingItem.id, data: { ...formData } }, {
          onSuccess: () => { setShowAddModal(false); setEditingItem(null) },
        })
      } else {
        addStapleMutation.mutate({ name: formData.name, category: formData.category }, {
          onSuccess: () => { setShowAddModal(false); setFormData({ ...formData, name: '' }) },
        })
      }
    } else {
      if (editingItem) {
        updateInventoryMutation.mutate({ id: editingItem.id, data: { ...formData } }, {
          onSuccess: () => { setShowAddModal(false); setEditingItem(null) },
        })
      } else {
        addInventoryMutation.mutate({
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          unit: formData.unit,
          expires_at: formData.expires_at || undefined,
          location: formData.location,
        }, {
          onSuccess: () => { setShowAddModal(false); setFormData({ ...formData, name: '' }) },
        })
      }
    }
  }

  const handleEdit = (item: PantryStaple | PantryInventoryItem) => {
    setEditingItem(item)
    const isStaple = 'default_unit' in item
    setFormData({
      name: item.name,
      category: item.category,
      default_unit: isStaple ? (item as PantryStaple).default_unit : (item as PantryInventoryItem).unit,
      default_quantity: isStaple ? (item as PantryStaple).default_quantity : (item as PantryInventoryItem).quantity,
      min_threshold: isStaple ? (item as PantryStaple).min_threshold : 0,
      quantity: isStaple ? (item as PantryStaple).default_quantity : (item as PantryInventoryItem).quantity,
      unit: isStaple ? (item as PantryStaple).default_unit : (item as PantryInventoryItem).unit,
      expires_at: 'expires_at' in item ? (item as PantryInventoryItem).expires_at || '' : '',
      location: 'location' in item ? (item as PantryInventoryItem).location || 'pantry' : 'pantry',
    })
    setShowAddModal(true)
  }

  const handleDelete = (id: string, type: 'staple' | 'inventory') => {
    if (type === 'staple') {
      deleteStapleMutation.mutate(id)
    } else {
      deleteInventoryMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn btn-ghost btn-sm p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <LogoMark className="w-8 h-8 text-teal-400" />
            <span className="font-semibold text-xl text-gray-900 dark:text-white">Pantry</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openAddStaple} className="btn btn-primary btn-sm hidden sm:flex">
              <Plus className="w-4 h-4 mr-2" />
              Add Staple
            </button>
            <button onClick={openAddInventory} className="btn btn-secondary btn-sm hidden sm:flex">
              <Package className="w-4 h-4 mr-2" />
              Add Item
            </button>
            <button onClick={openAddStaple} className="btn btn-primary btn-sm sm:hidden">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('staples')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === 'staples'
                ? 'text-teal-500 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            Staples <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">{staples.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === 'inventory'
                ? 'text-teal-500 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            Inventory <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">{inventory.length}</span>
            {expiringSoon.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                {expiringSoon.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Expiring Soon Banner */}
      {expiringSoon.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800"
        >
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{expiringSoon.length} item{expiringSoon.length > 1 ? 's' : ''} expiring in 3 days</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {expiringSoon.slice(0, 3).map((item: any) => (
                <span key={item.id} className="px-2 py-0.5 text-xs rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                  {item.name} ({formatDate(item.expires_at!)})
                </span>
              ))}
              {expiringSoon.length > 3 && (
                <span className="px-2 py-0.5 text-xs rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                  +{expiringSoon.length - 3} more
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        {/* Search & Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => setFilterExpiringSoon(!filterExpiringSoon)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                filterExpiringSoon
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <Filter className="w-4 h-4 inline mr-1.5" />
              Expiring Soon
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="popLayout">
          {activeTab === 'staples' ? (
            <motion.div
              key="staples"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {staplesLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 mx-auto text-teal-500 animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading staples...</p>
                </div>
              ) : filteredStaples.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No staples yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Add your always-on-hand ingredients so Yield knows what you have.
                  </p>
                  <button onClick={openAddStaple} className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Staple
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStaples.map((staple: any) => (
                    <StapleCard
                      key={staple.id}
                      staple={staple}
                      onEdit={() => handleEdit(staple)}
                      onDelete={() => handleDelete(staple.id, 'staple')}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {inventoryLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 mx-auto text-teal-500 animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading inventory...</p>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inventory items</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Track what you have right now with quantities and expiry dates.
                  </p>
                  <button onClick={openAddInventory} className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Item
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInventory.map((item: any) => (
                    <InventoryItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item.id, 'inventory')}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Sheet - Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowAddModal(false); setEditingItem(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {editingItem ? 'Edit' : activeTab === 'staples' ? 'Add Staple' : 'Add Inventory Item'}
                  </h3>
                </div>
                <button onClick={() => { setShowAddModal(false); setEditingItem(null) }} className="btn btn-ghost btn-sm p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input"
                    placeholder="e.g., chicken breast, garlic, rice"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit</label>
                    <select
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="input"
                    >
                      {units.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      required
                      className="input"
                    />
                  </div>
                  {activeTab === 'staples' && (
                    <div>
                      <label htmlFor="min_threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Min Threshold</label>
                      <input
                        id="min_threshold"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.min_threshold}
                        onChange={(e) => setFormData({ ...formData, min_threshold: parseFloat(e.target.value) || 0 })}
                        className="input"
                      />
                    </div>
                  )}
                  {activeTab === 'inventory' && (
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                      <select
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="input"
                      >
                        {locations.map((l) => (
                          <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {activeTab === 'staples' && (
                  <div>
                    <label htmlFor="default_quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Quantity</label>
                    <input
                      id="default_quantity"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.default_quantity}
                      onChange={(e) => setFormData({ ...formData, default_quantity: parseFloat(e.target.value) || 0 })}
                      className="input"
                    />
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div>
                    <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry Date (optional)</label>
                    <input
                      id="expires_at"
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="input"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null) }} className="flex-1 btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn btn-primary">
                    {editingItem ? 'Save Changes' : activeTab === 'staples' ? 'Add Staple' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

function StapleCard({ staple, onEdit, onDelete }: { staple: PantryStaple; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500/30 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-teal-500">STAPLE</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
              {staple.category.charAt(0).toUpperCase() + staple.category.slice(1)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {staple.name.charAt(0).toUpperCase() + staple.name.slice(1)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Default: {staple.default_quantity} {staple.default_unit}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Edit">
            <Edit className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={onDelete} className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" aria-label="Delete">
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function InventoryItemCard({ item, onEdit, onDelete }: { item: PantryInventoryItem; onEdit: () => void; onDelete: () => void }) {
  const status = getStatusColor(item)
  const daysLeft = item.expires_at ? Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  const statusStyles: Record<string, string> = {
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  }

  const statusText = () => {
    if (daysLeft === null) return 'No expiry'
    if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)}d ago`
    if (daysLeft === 0) return 'Expires today'
    if (daysLeft === 1) return 'Expires tomorrow'
    return `Expires in ${daysLeft}d`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500/30 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-teal-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.quantity} {item.unit} &bull; {item.location ? item.location.charAt(0).toUpperCase() + item.location.slice(1) : 'Unknown'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {item.expires_at && (
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusStyles[status])}>
              {statusText()}
            </span>
          )}
          <button onClick={onEdit} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors sm:opacity-0 sm:group-hover:opacity-100" aria-label="Edit">
            <Edit className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={onDelete} className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors sm:opacity-0 sm:group-hover:opacity-100" aria-label="Delete">
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
