import { generateCodename } from "@/lib/auth/generateCodename"

describe("generateCodename", () => {
  it("returns a non-empty string", () => {
    expect(generateCodename().length).toBeGreaterThan(0)
  })

  it("is PascalCase with no spaces", () => {
    const result = generateCodename()
    expect(/^[A-Z]/.test(result)).toBe(true)
    expect(/\s/.test(result)).toBe(false)
  })

  it("produces varied results across multiple calls", () => {
    const results = new Set(Array.from({ length: 20 }, () => generateCodename()))
    expect(results.size).toBeGreaterThan(1)
  })
})
