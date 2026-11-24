export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      draws: {
        Row: {
          budget_limit: number | null;
          code: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          event_date: string | null;
          id: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          budget_limit?: number | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_date?: string | null;
          id?: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          budget_limit?: number | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_date?: string | null;
          id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "draws_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          created_at: string;
          draw_id: string;
          email_sent: boolean;
          giver_id: string;
          id: string;
          receiver_id: string;
        };
        Insert: {
          created_at?: string;
          draw_id: string;
          email_sent?: boolean;
          giver_id: string;
          id?: string;
          receiver_id: string;
        };
        Update: {
          created_at?: string;
          draw_id?: string;
          email_sent?: boolean;
          giver_id?: string;
          id?: string;
          receiver_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_draw_id_fkey";
            columns: ["draw_id"];
            isOneToOne: false;
            referencedRelation: "draws";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_giver_id_fkey";
            columns: ["giver_id"];
            isOneToOne: false;
            referencedRelation: "participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "participants";
            referencedColumns: ["id"];
          },
        ];
      };
      participants: {
        Row: {
          created_at: string;
          draw_id: string;
          email: string;
          id: string;
          name: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          draw_id: string;
          email: string;
          id?: string;
          name: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          draw_id?: string;
          email: string;
          id?: string;
          name: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "participants_draw_id_fkey";
            columns: ["draw_id"];
            isOneToOne: false;
            referencedRelation: "draws";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          participant_id: string;
          price: number | null;
          title: string;
          updated_at: string;
          url: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          participant_id: string;
          price?: number | null;
          title: string;
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          participant_id?: string;
          price?: number | null;
          title: string;
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_participant_id_fkey";
            columns: ["participant_id"];
            isOneToOne: false;
            referencedRelation: "participants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type DrawRow = Database["public"]["Tables"]["draws"]["Row"];
export type ParticipantRow = Database["public"]["Tables"]["participants"]["Row"];
export type MatchRow = Database["public"]["Tables"]["matches"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type WishlistItemRow = Database["public"]["Tables"]["wishlist_items"]["Row"];
