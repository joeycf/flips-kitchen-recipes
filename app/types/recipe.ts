// Recipe domain model — mirrors the Claude Design export handoff spec.

export interface Ingredient {
  qty: string
  unit: string
  name: string
}

export interface Step {
  text: string
  photo?: string | null
}

export interface Recipe {
  id: string
  title: string
  // Common values: 'Filipino' | 'Thai' | 'Japanese' — any cuisine string is allowed.
  cuisine: string
  description: string
  prep: number // minutes
  cook: number // minutes
  total: number // minutes
  servings: number
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
  hero?: string | null
  gallery?: string[]
  youtube?: string | null
  ingredients: Ingredient[]
  steps: Step[]
}
