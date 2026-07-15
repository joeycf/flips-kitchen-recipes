// Supabase schema types — the single source of truth for row shapes.
//
// Hand-written to exactly match supabase/migrations/0001_init.sql (this repo has
// no live-DB access during the build). Written in `supabase gen types typescript`
// style so it can later be swapped for generated output with a clean diff:
//
//   npx supabase gen types typescript --project-id <ref> > app/types/database.types.ts
//
// Wired into @nuxtjs/supabase via the `types` option in nuxt.config.ts, which
// makes useSupabaseClient()/serverSupabaseClient() fully typed against `Database`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          cuisine: string | null
          hero_image: string | null
          gallery: string[]
          youtube_url: string | null
          prep_minutes: number | null
          cook_minutes: number | null
          servings: number | null
          difficulty: string | null
          tags: string[]
          instructions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          cuisine?: string | null
          hero_image?: string | null
          gallery?: string[]
          youtube_url?: string | null
          prep_minutes?: number | null
          cook_minutes?: number | null
          servings?: number | null
          difficulty?: string | null
          tags?: string[]
          instructions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          cuisine?: string | null
          hero_image?: string | null
          gallery?: string[]
          youtube_url?: string | null
          prep_minutes?: number | null
          cook_minutes?: number | null
          servings?: number | null
          difficulty?: string | null
          tags?: string[]
          instructions?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          position: number | null
          quantity: number | null
          unit: string | null
          name: string
          name_key: string | null
        }
        Insert: {
          id?: string
          recipe_id: string
          position?: number | null
          quantity?: number | null
          unit?: string | null
          name: string
          name_key?: string | null
        }
        Update: {
          id?: string
          recipe_id?: string
          position?: number | null
          quantity?: number | null
          unit?: string | null
          name?: string
          name_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'recipe_ingredients_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
