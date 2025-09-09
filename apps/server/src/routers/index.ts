import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import { donationRouter } from './donation';
import { programRouter } from './program';

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK';
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is private',
      user: ctx.session.user,
    };
  }),
  donation: donationRouter,
  program: programRouter,
});
export type AppRouter = typeof appRouter;
