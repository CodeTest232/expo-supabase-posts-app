import { supabase } from './supabase';
import { Post, CreatePostInput } from '../types';

export const postService = {
  createPost: async (post: CreatePostInput): Promise<Post> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: post.title,
        content: post.content,
        image_url: post.image_url || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  getMyPosts: async (): Promise<Post[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Post[];
  },

  deletePost: async (postId: string): Promise<void> => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },
};

