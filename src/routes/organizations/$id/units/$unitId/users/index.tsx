import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organizations/$id/units/$unitId/users/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/organizations/$id/units/$unitId/users/"!</div>
}
