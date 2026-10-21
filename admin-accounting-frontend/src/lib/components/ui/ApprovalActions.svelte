<script lang="ts">
	import Button from './Button.svelte';

	export let disabled = false;
	export let onApprove: (() => void) | undefined = undefined;
	export let onReject: (() => void) | undefined = undefined;
	export let approveLabel = 'Approve';
	export let rejectLabel = 'Reject';
	export let rejectFirst = false;
</script>

{#if rejectFirst && onReject}
	<Button size="sm" variant="danger" {disabled} on:click={onReject}>{rejectLabel}</Button>
{/if}
{#if onApprove}
	<Button size="sm" variant="success" {disabled} on:click={onApprove}>{approveLabel}</Button>
{/if}
{#if !rejectFirst && onReject}
	<Button size="sm" variant="danger" {disabled} on:click={onReject}>{rejectLabel}</Button>
{/if}
