import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArticlesApi } from './useApi';
import { Article } from '@common/models';

/**
 * Hook to fetch all articles
 */
export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => ArticlesApi.getAll(),
  });
}

/**
 * Hook to fetch a specific article
 */
export function useArticle(articleId?: string, enabled = true) {
  return useQuery({
    queryKey: ['article', articleId],
    queryFn: () => ArticlesApi.getById(articleId!),
    enabled: !!articleId && enabled,
  });
}

/**
 * Hook to create a new article
 */
export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (article: Article) => {
      return ArticlesApi.create(article);
    },
    onSuccess: (newArticle) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.setQueryData(['article', newArticle.id], newArticle);
    },
  });
}

/**
 * Hook to update an existing article
 */
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (article: Article) => {
      return ArticlesApi.update(article.id, article);
    },
    onSuccess: (updatedArticle) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.setQueryData(['article', updatedArticle.id], updatedArticle);
    },
  });
}

/**
 * Hook to delete an article
 */
export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (articleId: string) => {
      return ArticlesApi.delete(articleId);
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.removeQueries({ queryKey: ['article', articleId] });
    },
  });
}