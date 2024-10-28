export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url: string;
  tags?: string[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}