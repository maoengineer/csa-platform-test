// ============================================================
// CSA Platform — TypeScript Types
// ============================================================

export type UserRole = 'user' | 'moderator' | 'admin';
export type ReactionType = 'like' | 'love' | 'haha' | 'sad' | 'angry';
export type ReportReason = 'politics' | 'adult' | 'fake' | 'harassment' | 'spam' | 'impersonation' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';
export type NotificationType = 'comment' | 'reaction' | 'message' | 'mention' | 'system' | 'announcement';

export interface University {
  id: string;
  name_en: string;
  name_kh: string;
  abbreviation: string;
  logo_url: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  university_id: string;
  name_en: string;
  name_kh: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  student_id: string | null;
  university_id: string | null;
  department_id: string | null;
  year_of_study: number | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
  last_seen_at: string;
  // Joins
  university?: University;
  department?: Department;
}

export interface FontStyle {
  fontFamily: string;
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  textAlign: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  font_style: FontStyle | string;
  is_announcement: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  author?: User;
  reactions?: Reaction[];
  comments?: Comment[];
  reaction_counts?: Record<ReactionType, number>;
  comment_count?: number;
  user_reaction?: ReactionType | null;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  type: ReactionType;
  created_at: string;
  user?: User;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  author?: User;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  partner: User;
  last_message: Message;
  unread_count: number;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  reporter_name: string | null;
  reporter_student_id: string | null;
  reported_post_id: string | null;
  reported_user_id: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  moderator_id: string | null;
  moderator_notes: string | null;
  created_at: string;
  reporter?: User;
  reported_post?: Post;
  reported_user?: User;
  moderator?: User;
}

export interface PasswordResetRequest {
  id: string;
  requester_name: string;
  student_id: string;
  university_id: string | null;
  email: string;
  description: string;
  status: ReportStatus;
  moderator_id: string | null;
  moderator_notes: string | null;
  reset_at: string | null;
  created_at: string;
  university?: University;
  moderator?: User;
}

export interface ModeratorPermissions {
  id: string;
  moderator_id: string;
  can_reset_password: boolean;
  can_handle_reports: boolean;
  can_edit_universities: boolean;
  can_manage_users: boolean;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
}

// Form types
export interface RegisterFormData {
  full_name: string;
  username: string;
  email: string;
  password: string;
  university_id: string;
  department_id: string;
  student_id: string;
  year_of_study: number;
  bio?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreatePostFormData {
  content: string;
  font_style: FontStyle;
}

export interface ReportFormData {
  reason: ReportReason;
  details?: string;
  reported_post_id?: string;
  reported_user_id?: string;
  reporter_name?: string;
  reporter_student_id?: string;
}

// Admin stats
export interface AdminStats {
  total_users: number;
  total_posts: number;
  posts_today: number;
  active_users: number;
  pending_reports: number;
  pending_resets: number;
}
