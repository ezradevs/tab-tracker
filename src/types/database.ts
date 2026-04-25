export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type CategoryType = "groceries" | "transport" | "bills" | "dining" | "household" | "other"
export type UserRole = "owner" | "mum"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          role: UserRole
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          role: UserRole
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          role?: UserRole
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      family_groups: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          group_id: string
          payer_id: string
          description: string
          amount: number
          category: CategoryType
          transaction_date: string
          notes: string | null
          is_settled: boolean
          settlement_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          payer_id: string
          description: string
          amount: number
          category?: CategoryType
          transaction_date?: string
          notes?: string | null
          is_settled?: boolean
          settlement_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          payer_id?: string
          description?: string
          amount?: number
          category?: CategoryType
          transaction_date?: string
          notes?: string | null
          is_settled?: boolean
          settlement_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      settlements: {
        Row: {
          id: string
          group_id: string
          payer_id: string
          payee_id: string
          amount: number
          notes: string | null
          settled_at: string
          created_by: string
        }
        Insert: {
          id?: string
          group_id: string
          payer_id: string
          payee_id: string
          amount: number
          notes?: string | null
          settled_at?: string
          created_by: string
        }
        Update: {
          id?: string
          group_id?: string
          payer_id?: string
          payee_id?: string
          amount?: number
          notes?: string | null
          settled_at?: string
          created_by?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          id: string
          token: string
          group_id: string
          role: UserRole
          created_by: string
          used_by: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          token: string
          group_id: string
          role: UserRole
          created_by: string
          used_by?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          token?: string
          group_id?: string
          role?: UserRole
          created_by?: string
          used_by?: string | null
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      group_balance: {
        Row: {
          group_id: string
          owner_id: string
          mum_id: string
          balance: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Settlement = Database["public"]["Tables"]["settlements"]["Row"]
export type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"]
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"]

export interface AppUser {
  id: string
  email: string
  profile: Profile
  groupId: string
  partnerProfile: Profile | null
}
