import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/organizations/$id/units/$unitId/profiles/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/organizations/$id/units/$unitId/profiles/"!</div>
}
