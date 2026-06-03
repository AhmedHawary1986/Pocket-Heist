import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import StatusBadge from "@/components/StatusBadge"

describe("StatusBadge", () => {
  it("renders SUCCESS for a successful heist", () => {
    render(<StatusBadge status="success" />)
    expect(screen.getByText("success")).toBeInTheDocument()
  })

  it("renders FAILURE for a failed heist", () => {
    render(<StatusBadge status="failure" />)
    expect(screen.getByText("failure")).toBeInTheDocument()
  })

  it("renders nothing when status is null", () => {
    const { container } = render(<StatusBadge status={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
