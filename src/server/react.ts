import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { TRPCRouter } from "./routers";

export const { TRPCProvider, useTRPC } = createTRPCContext<TRPCRouter>();
