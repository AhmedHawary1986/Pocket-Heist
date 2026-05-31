const descriptors = ["Silent", "Shadow", "Phantom", "Crimson", "Iron", "Ghost", "Slick", "Rogue"]
const nouns = ["Fox", "Vault", "Wire", "Blade", "Cipher", "Crown", "Dagger", "Mask"]
const roles = ["Ace", "Fixer", "Runner", "Broker", "Hawk", "Shade", "Ghost", "Mark"]

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

export function generateCodename(): string {
  return pick(descriptors) + pick(nouns) + pick(roles)
}
