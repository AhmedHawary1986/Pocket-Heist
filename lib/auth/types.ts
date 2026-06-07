export interface AppUser {
  uid: string
  email: string | null
}

export interface UserContextValue {
  user: AppUser | null
  loading: boolean
}
