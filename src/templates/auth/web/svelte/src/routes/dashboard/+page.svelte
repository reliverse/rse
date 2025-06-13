<script lang="ts">
import { onMount } from "svelte";
// @ts-expect-error <dler-remove-comment>
import { goto } from "$app/navigation";
// @ts-expect-error <dler-remove-comment>
import { authClient } from "$lib/auth-client";
// @ts-expect-error <dler-remove-comment>
import { orpc } from "$lib/orpc";
import { createQuery } from "@tanstack/svelte-query";
import { get } from "svelte/store";

const sessionQuery = authClient.useSession();

const privateDataQuery = createQuery(orpc.privateData.queryOptions());

onMount(() => {
	// @ts-expect-error <dler-remove-comment>
  const { data: session, isPending } = get(sessionQuery);
  if (!session && !isPending) {
    goto("/login");
  }
});
</script>

{#if $sessionQuery.isPending}
	<div>Loading...</div>
{:else if !$sessionQuery.data}
	<!-- Redirecting... -->
{:else}
	<div>
		<h1>Dashboard</h1>
		<p>Welcome {$sessionQuery.data.user.name}</p>
		<p>privateData: {$privateDataQuery.data?.message}</p>
	</div>
{/if}
