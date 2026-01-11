export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          created_at: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          name?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
        }
      }
      profiles: {
        Row: {
          id: string
          family_id: string | null
          role: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          family_id?: string | null
          role?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string | null
          role?: string
          email?: string
          created_at?: string
        }
      }
      children: {
        Row: {
          id: string
          family_id: string
          name: string
          linking_code: string | null
          linking_code_expires_at: string | null
          device_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          linking_code?: string | null
          linking_code_expires_at?: string | null
          device_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          linking_code?: string | null
          linking_code_expires_at?: string | null
          device_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
