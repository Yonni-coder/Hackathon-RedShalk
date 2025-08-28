import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // 🔑 clé utilisée dans localStorage
    }
  )
)