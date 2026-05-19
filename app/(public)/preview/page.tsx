// preview page for newly created UI components
import Skeleton from "@/components/Skeleton"
import Avatar from "@/components/Avatar"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>

      <h3 className="mt-8 mb-4 font-bold">Avatar</h3>
      <div className="flex gap-4 items-center">
        <Avatar name="alice" />
        <Avatar name="PocketHeist" />
        <Avatar name="Alice" />
        <Avatar name="JohnDoe" />
      </div>
    </div>
  )
}
