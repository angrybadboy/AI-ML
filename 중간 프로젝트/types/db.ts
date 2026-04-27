/**
 * Supabase 데이터베이스 타입.
 *
 * ⚠️ 임시 수동 작성본. 실제 Supabase 프로젝트 연결 후
 *   supabase gen types typescript --project-id <id> > types/db.ts
 * 로 자동 생성된 결과로 교체할 것 (Phase 1 종료 직전).
 *
 * TRD §3.1 + CLAUDE.md §1.4 (serial_no, category 추가) 기준.
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          created_at: string;
          subscription_status: "free" | "premium";
          subscription_expires_at: string | null;
        };
        Insert: {
          id: string;
          nickname: string;
          created_at?: string;
          subscription_status?: "free" | "premium";
          subscription_expires_at?: string | null;
        };
        Update: {
          id?: string;
          nickname?: string;
          created_at?: string;
          subscription_status?: "free" | "premium";
          subscription_expires_at?: string | null;
        };
        Relationships: [];
      };
      daily_quotes: {
        Row: {
          id: string;
          serial_no: number;
          date: string;
          title: string;
          body: string;
          category:
            | "고요"
            | "위로"
            | "사랑"
            | "용기"
            | "그리움"
            | "사색";
          source_type: "ai" | "curated";
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          serial_no?: number;
          date: string;
          title: string;
          body: string;
          category:
            | "고요"
            | "위로"
            | "사랑"
            | "용기"
            | "그리움"
            | "사색";
          source_type: "ai" | "curated";
          tags?: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_quotes"]["Insert"]>;
        Relationships: [];
      };
      saved_items: {
        Row: {
          id: string;
          user_id: string;
          item_type: "daily" | "user";
          item_id: string;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: "daily" | "user";
          item_id: string;
          saved_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_items"]["Insert"]>;
        Relationships: [];
      };
      user_posts: {
        Row: {
          id: string;
          serial_no: number;
          user_id: string;
          title: string;
          body: string;
          category:
            | "고요"
            | "위로"
            | "사랑"
            | "용기"
            | "그리움"
            | "사색";
          visibility: "public" | "private";
          tags: string[];
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          serial_no?: number;
          user_id: string;
          title: string;
          body: string;
          category:
            | "고요"
            | "위로"
            | "사랑"
            | "용기"
            | "그리움"
            | "사색";
          visibility?: "public" | "private";
          tags?: string[];
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_posts"]["Insert"]>;
        Relationships: [];
      };
      post_likes: {
        Row: {
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["post_likes"]["Insert"]>;
        Relationships: [];
      };
      payment_logs: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          payment_key: string | null;
          amount: number;
          status: "ready" | "approved" | "failed" | "canceled";
          raw_response: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          payment_key?: string | null;
          amount: number;
          status: "ready" | "approved" | "failed" | "canceled";
          raw_response?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_logs"]["Insert"]>;
        Relationships: [];
      };
      fallback_quotes: {
        Row: {
          id: string;
          title: string;
          body: string;
          category:
            | "고요"
            | "위로"
            | "사랑"
            | "용기"
            | "그리움"
            | "사색";
          tags: string[];
          used_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          category:
            | "고요"
            | "위로"
            | "사랑"
            | "용기"
            | "그리움"
            | "사색";
          tags?: string[];
          used_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fallback_quotes"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
