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
          birth_date: string | null
          gender: string | null
          vision_condition: string
          wears_glasses: boolean
          current_prescription_left: number | null
          current_prescription_right: number | null
          data_consent_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          linking_code?: string | null
          linking_code_expires_at?: string | null
          device_id?: string | null
          created_at?: string
          birth_date?: string | null
          gender?: string | null
          vision_condition?: string
          wears_glasses?: boolean
          current_prescription_left?: number | null
          current_prescription_right?: number | null
          data_consent_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          linking_code?: string | null
          linking_code_expires_at?: string | null
          device_id?: string | null
          created_at?: string
          birth_date?: string | null
          gender?: string | null
          vision_condition?: string
          wears_glasses?: boolean
          current_prescription_left?: number | null
          current_prescription_right?: number | null
          data_consent_at?: string | null
        }
      }
      vision_history: {
        Row: {
          id: string
          child_id: string
          recorded_at: string
          prescription_left: number | null
          prescription_right: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          recorded_at?: string
          prescription_left?: number | null
          prescription_right?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          recorded_at?: string
          prescription_left?: number | null
          prescription_right?: number | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
