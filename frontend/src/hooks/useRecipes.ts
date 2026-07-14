'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRecipes, deleteRecipe } from '@/lib/api'
import toast from 'react-hot-toast'

export function useRecipes(options?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['recipes', options],
    queryFn: () => getRecipes(options),
    enabled: true,
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipeId: string) => deleteRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe deleted')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete recipe')
    },
  })
}
