import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query'
import { collectionsApi } from '@/lib/api/collections'
import type {
  Collection,
  CollectionCreate,
  CollectionUpdate,
  CollectionListResponse,
  CollectionStats,
  CollectionHealthCheck,
  CollectionFilters,
  MessageResponse,
  OperationResponse,
  APIError
} from '@/lib/types'

// Query keys
export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (filters: CollectionFilters) => [...collectionKeys.lists(), filters] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
  stats: (id: string) => [...collectionKeys.detail(id), 'stats'] as const,
  health: (id: string) => [...collectionKeys.detail(id), 'health'] as const,
  summary: () => [...collectionKeys.all, 'summary'] as const,
  search: (query: string) => [...collectionKeys.all, 'search', query] as const,
}

// Hook to get all collections
export function useCollections(
  filters: CollectionFilters = {},
  options?: Omit<UseQueryOptions<CollectionListResponse, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: collectionKeys.list(filters),
    queryFn: () => collectionsApi.getAll(filters),
    ...options,
  })
}

// Hook to get paginated collections
export function usePaginatedCollections(
  page = 1,
  size = 20,
  filters: Omit<CollectionFilters, 'skip' | 'limit'> = {},
  options?: Omit<UseQueryOptions<CollectionListResponse, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: collectionKeys.list({ ...filters, skip: (page - 1) * size, limit: size }),
    queryFn: () => collectionsApi.getPaginated(page, size, filters),
    keepPreviousData: true, // Keep previous page data while loading new page
    ...options,
  })
}

// Hook to get a single collection
export function useCollection(
  id: string,
  options?: Omit<UseQueryOptions<Collection, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: () => collectionsApi.getById(id),
    enabled: !!id, // Only fetch if id is provided
    ...options,
  })
}

// Hook to get collection statistics
export function useCollectionStats(
  id: string,
  options?: Omit<UseQueryOptions<CollectionStats, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: collectionKeys.stats(id),
    queryFn: () => collectionsApi.getStats(id),
    enabled: !!id,
    ...options,
  })
}

// Hook to check collection health
export function useCollectionHealth(
  id: string,
  options?: Omit<UseQueryOptions<CollectionHealthCheck, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: collectionKeys.health(id),
    queryFn: () => collectionsApi.healthCheck(id),
    enabled: !!id,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for health status
    ...options,
  })
}

// Hook to get summary statistics
export function useCollectionSummary(
  options?: Omit<UseQueryOptions<any, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: collectionKeys.summary(),
    queryFn: () => collectionsApi.getSummaryStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

// Hook to search collections
export function useSearchCollections(
  query: string,
  options?: Omit<UseQueryOptions<Collection[], APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: collectionKeys.search(query),
    queryFn: () => collectionsApi.search(query),
    enabled: !!query && query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  })
}

// Hook to create a collection
export function useCreateCollection(
  options?: UseMutationOptions<Collection, APIError, CollectionCreate>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CollectionCreate) => collectionsApi.create(data),
    onSuccess: (newCollection) => {
      // Update the collections list cache
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: collectionKeys.summary() })

      // Add the new collection to the detail cache
      queryClient.setQueryData(collectionKeys.detail(newCollection.id), newCollection)
    },
    ...options,
  })
}

// Hook to update a collection
export function useUpdateCollection(
  options?: UseMutationOptions<Collection, APIError, { id: string; data: CollectionUpdate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => collectionsApi.update(id, data),
    onSuccess: (updatedCollection, { id }) => {
      // Update the collections list cache
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: collectionKeys.summary() })

      // Update the specific collection cache
      queryClient.setQueryData(collectionKeys.detail(id), updatedCollection)
      queryClient.invalidateQueries({ queryKey: collectionKeys.stats(id) })
      queryClient.invalidateQueries({ queryKey: collectionKeys.health(id) })
    },
    ...options,
  })
}

// Hook to delete a collection
export function useDeleteCollection(
  options?: UseMutationOptions<MessageResponse, APIError, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => collectionsApi.delete(id),
    onSuccess: (_, id) => {
      // Remove the collection from all caches
      queryClient.removeQueries({ queryKey: collectionKeys.detail(id) })
      queryClient.removeQueries({ queryKey: collectionKeys.stats(id) })
      queryClient.removeQueries({ queryKey: collectionKeys.health(id) })

      // Update the collections list cache
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: collectionKeys.summary() })
    },
    ...options,
  })
}

// Hook to sync a collection
export function useSyncCollection(
  options?: UseMutationOptions<OperationResponse, APIError, { id: string; force?: boolean }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, force = false }) => collectionsApi.sync(id, { force }),
    onSuccess: (_, { id }) => {
      // Invalidate collection-related queries to reflect sync status
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: collectionKeys.stats(id) })
      queryClient.invalidateQueries({ queryKey: collectionKeys.health(id) })
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
    },
    ...options,
  })
}

// Hook to batch delete collections
export function useBatchDeleteCollections(
  options?: UseMutationOptions<MessageResponse[], APIError, string[]>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => collectionsApi.batchDelete(ids),
    onSuccess: (_, ids) => {
      // Remove all deleted collections from caches
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: collectionKeys.detail(id) })
        queryClient.removeQueries({ queryKey: collectionKeys.stats(id) })
        queryClient.removeQueries({ queryKey: collectionKeys.health(id) })
      })

      // Update the collections list cache
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: collectionKeys.summary() })
    },
    ...options,
  })
}

// Hook to check if collection name is available
export function useCheckCollectionName(
  name: string,
  excludeId?: string
) {
  return useQuery({
    queryKey: ['collection-name-check', name, excludeId],
    queryFn: () => collectionsApi.isNameAvailable(name, excludeId),
    enabled: !!name && name.length > 0,
    staleTime: 0, // Always check for fresh data
  })
}