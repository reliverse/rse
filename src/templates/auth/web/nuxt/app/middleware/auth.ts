// @ts-expect-error dler-remove-comment
export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (import.meta.server) return;

  // @ts-expect-error dler-remove-comment
  const { $authClient } = useNuxtApp();
  const session = $authClient.useSession();

  if (session.value.isPending || !session.value) {
    if (to.path === "/dashboard") {
      // @ts-expect-error dler-remove-comment
      return navigateTo("/login");
    }
  }
});
