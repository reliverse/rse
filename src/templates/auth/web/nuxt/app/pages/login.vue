<script setup lang="ts">
// @ts-expect-error <dler-remove-comment>
const { $authClient } = useNuxtApp();
// @ts-expect-error <dler-remove-comment>
import SignInForm from "~/components/SignInForm.vue";
// @ts-expect-error <dler-remove-comment>
import SignUpForm from "~/components/SignUpForm.vue";

const session = $authClient.useSession();
// @ts-expect-error <dler-remove-comment>
const showSignIn = ref(true);

// @ts-expect-error <dler-remove-comment>
watchEffect(() => {
  if (!session?.value.isPending && session?.value.data) {
    // @ts-expect-error <dler-remove-comment>
    navigateTo("/dashboard", { replace: true });
  }
});
</script>

<template>
  <div>
    <Loader v-if="session.isPending" />
    <div v-else-if="!session.data">
      <SignInForm v-if="showSignIn" @switch-to-sign-up="showSignIn = false" />
      <SignUpForm v-else @switch-to-sign-in="showSignIn = true" />
    </div>
  </div>
</template>
