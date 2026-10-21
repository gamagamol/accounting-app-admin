<script lang="ts">
	import Badge from './Badge.svelte';
	import type { TableColumn } from '$lib/types';

	export let column: TableColumn;
	export let row: any;
	export let badge: boolean | undefined = undefined;
	export let badgeLabels: Record<string, string> | undefined = undefined;

	$: value = row[column.key];
	$: showBadge = badge ?? column.badge ?? false;
	$: labels = badgeLabels ?? column.badgeLabels ?? {};
</script>

{#if showBadge}
	<Badge status={String(value ?? '')} label={labels[String(value)] ?? ''} />
{:else if column.format}
	{column.format(value, row)}
{:else}
	{value ?? '-'}
{/if}
