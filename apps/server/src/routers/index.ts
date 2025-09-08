import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import { todoRouter } from './todo';
import { donationRouter } from './donation';

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
  todo: todoRouter,
  donation: donationRouter,
});
export type AppRouter = typeof appRouter;
