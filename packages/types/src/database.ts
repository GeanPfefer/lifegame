// Gerado manualmente a partir do schema em supabase/migrations/.
// Para regenerar: npx supabase gen types typescript --local > packages/types/src/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      pillar_catalog: {
        Row: {
          id: string;
          name: string;
          xp_rate: number;
          focus: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          name: string;
          xp_rate: number;
          focus: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          xp_rate?: number;
          focus?: string;
          sort_order?: number;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          name: string;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          onboarding_completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      user_pillars: {
        Row: {
          id: string;
          user_id: string;
          catalog_id: string | null;
          name: string;
          xp_rate: number;
          is_active: boolean;
          is_priority: boolean;
          xp_total: number;
          level: number;
          baseline_score: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          catalog_id?: string | null;
          name: string;
          xp_rate: number;
          is_active?: boolean;
          is_priority?: boolean;
          xp_total?: number;
          level?: number;
          baseline_score?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          catalog_id?: string | null;
          name?: string;
          xp_rate?: number;
          is_active?: boolean;
          is_priority?: boolean;
          xp_total?: number;
          level?: number;
          baseline_score?: number | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_pillars_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_pillars_catalog_id_fkey';
            columns: ['catalog_id'];
            isOneToOne: false;
            referencedRelation: 'pillar_catalog';
            referencedColumns: ['id'];
          },
        ];
      };

      quests: {
        Row: {
          id: string;
          user_id: string;
          pillar_id: string;
          title: string;
          description: string | null;
          type: Database['public']['Enums']['quest_type'];
          status: Database['public']['Enums']['quest_status'];
          xp_reward: number;
          target_date: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pillar_id: string;
          title: string;
          description?: string | null;
          type: Database['public']['Enums']['quest_type'];
          status?: Database['public']['Enums']['quest_status'];
          xp_reward: number;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          pillar_id?: string;
          title?: string;
          description?: string | null;
          type?: Database['public']['Enums']['quest_type'];
          status?: Database['public']['Enums']['quest_status'];
          xp_reward?: number;
          target_date?: string | null;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'quests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'quests_pillar_id_fkey';
            columns: ['pillar_id'];
            isOneToOne: false;
            referencedRelation: 'user_pillars';
            referencedColumns: ['id'];
          },
        ];
      };

      quest_missions: {
        Row: {
          id: string;
          quest_id: string;
          title: string;
          xp_reward: number;
          sort_order: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quest_id: string;
          title: string;
          xp_reward: number;
          sort_order?: number;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          xp_reward?: number;
          sort_order?: number;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'quest_missions_quest_id_fkey';
            columns: ['quest_id'];
            isOneToOne: false;
            referencedRelation: 'quests';
            referencedColumns: ['id'];
          },
        ];
      };

      xp_records: {
        Row: {
          id: string;
          user_id: string;
          pillar_id: string;
          quest_id: string | null;
          duration_minutes: number;
          base_xp: number;
          bonus_multiplier: number;
          total_xp: number;
          bonuses: Database['public']['Enums']['activity_bonus'][];
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pillar_id: string;
          quest_id?: string | null;
          duration_minutes: number;
          base_xp: number;
          bonus_multiplier?: number;
          total_xp: number;
          bonuses?: Database['public']['Enums']['activity_bonus'][];
          note?: string | null;
          created_at?: string;
        };
        // Imutável por design — use Insert only. Update vazio impede modificações acidentais.
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: 'xp_records_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      life_events: {
        Row: {
          id: string;
          user_id: string;
          pillar_id: string;
          quest_id: string | null;
          mission_id: string | null;
          event_type: Database['public']['Enums']['event_type'];
          anchor_type: Database['public']['Enums']['context_anchor'] | null;
          anchor_value: number | null;
          description: string;
          xp_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pillar_id: string;
          quest_id?: string | null;
          mission_id?: string | null;
          event_type: Database['public']['Enums']['event_type'];
          anchor_type?: Database['public']['Enums']['context_anchor'] | null;
          anchor_value?: number | null;
          description: string;
          xp_awarded: number;
          created_at?: string;
        };
        // Imutável por design — use Insert only.
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: 'life_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };

    Views: {
      character_stats: {
        Row: {
          user_id: string;
          character_level: number;
          total_xp_all_pillars: number;
          active_pillar_count: number;
          pillars: Json;
        };
        Relationships: [];
      };
    };

    Functions: {
      lifegame_get_level_from_xp: {
        Args: { p_total_xp: number };
        Returns: number;
      };
    };

    Enums: {
      quest_type: 'main' | 'habit' | 'learning' | 'challenge';
      quest_status: 'open' | 'in_progress' | 'completed' | 'abandoned';
      event_type: 'quest_milestone' | 'context_event' | 'state_change';
      context_anchor: 'financial' | 'physical_achievement' | 'meaningful_connection';
      activity_bonus: 'forgotten_pillar' | 'active_streak' | 'first_of_day' | 'active_quest';
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Atalhos úteis para tipagem rápida em queries
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
