import { render, screen } from "@testing-library/react"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders the first letter of a simple name", () => {
    render(<Avatar name="alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("renders first 2 uppercase letters for PascalCase names", () => {
    render(<Avatar name="PocketHeist" />)
    expect(screen.getByText("PH")).toBeInTheDocument()
  })

  it("renders single uppercase letter for single-word capitalized name", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })
})
