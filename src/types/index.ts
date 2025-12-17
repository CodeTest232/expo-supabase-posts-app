import { Database } from './database.types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  CreatePost: undefined;
  MyPosts: undefined;
};

export type RootTabParamList = {
  MyPostsTab: { refresh?: boolean } | undefined;
  CreatePostTab: undefined;
  ProfileTab: undefined;
};

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface CreatePostInput {
  title: string;
  content: string;
  image_url?: string;
}
