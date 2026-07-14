'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPantryStaples,
  addPantryStaple,
  updatePantryStaple,
  deletePantryStaple,
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '@/lib/api'
import toast from 'react-hot-toast'

// ─── Staples ──────────────────────────────────────────────────────────────────

export function usePantryStaples() {
  return useQuery({
    queryKey: ['pantry', 'staples'],
    queryFn: () => getPantryStaples(),
  })
}

export function useAddPantryStaple() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (staple: { name: string; category: string }) => addPantryStaple(staple),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry', 'staples'] })
      toast.success('Staple added')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add staple'),
  })
}

export function useUpdatePantryStaple() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updatePantryStaple(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry', 'staples'] })
      toast.success('Staple updated')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update staple'),
  })
}

export function useDeletePantryStaple() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePantryStaple(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry', 'staples'] })
      toast.success('Staple removed')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to remove staple'),
  })
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function useInventory(options?: { location?: string; expiring_soon?: boolean }) {
  return useQuery({
    queryKey: ['pantry', 'inventory', options],
    queryFn: () => getInventory(options),
  })
}

export function useAddInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (item: { name: string; category: string; quantity: number; unit: string; expires_at?: string; location?: string }) =>
      addInventoryItem(item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry', 'inventory'] })
      toast.success('Item added')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add item'),
  })
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateInventoryItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry', 'inventory'] })
      toast.success('Item updated')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update item'),
  })
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry', 'inventory'] })
      toast.success('Item removed')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to remove item'),
  })
}
