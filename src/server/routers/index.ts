import { createTRPCRouter } from "../trpc";
import { appointmentRouter } from "./appointment";
import { organizationRouter } from "./organization";
import { profileRouter } from "./profile";
import { unitRouter } from "./unit";
import { userRouter } from "./user";

export const trpcRouter = createTRPCRouter({
   organization: organizationRouter,
   appointment: appointmentRouter,
   unit: unitRouter,
   profile: profileRouter,
   user: userRouter,
});

export type TRPCRouter = typeof trpcRouter;
