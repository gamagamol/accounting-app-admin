<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import TransactionPageShell from './TransactionPageShell.svelte';
	import type { FieldDef } from '$lib/types/entity';

	export let title: string;
	export let description: string = '';
	export let backHref: string;
	export let backLabel: string = 'Back to list';
	export let eyebrow: string = '';
	export let fields: FieldDef[] = [];
	export let values: any = {};
	export let submitLabel: string = 'Save';
	export let onSubmit: (payload: Record<string, any>) => void | Promise<void> = () => {};
	export let auditEntityType: string = '';
	export let auditEntityId: string = '';
	export let documentNumber: string = '';

	let form: Record<string, any> = {};
	let lastValuesKey = '';

	$: hasDescriptionField = fields.some(
		(field) => field.key === 'description' || field.key === 'message'
	);
	$: valuesKey = JSON.stringify(values);
	$: if (valuesKey !== lastValuesKey) {
		lastValuesKey = valuesKey;
		form = { ...blankForm(fields), ...values };
		if (!textValue(form.description)) {
			form.description = textValue(values.message) ?? '';
		}
	}

	function textValue(value: unknown): string {
		return typeof value === 'string' ? value.trim() : '';
	}

	function blankForm(definitions: FieldDef[]): Record<string, any> {
		const result: Record<string, any> = {};
		for (const field of definitions) {
			if (field.defaultValue !== undefined) result[field.key] = field.defaultValue;
			else if (field.type === 'number' || field.type === 'currency') result[field.key] = 0;
			else if (field.type === 'select') result[field.key] = field.options?.[0]?.value ?? '';
			else result[field.key] = '';
		}
		return result;
	}

	function updateField(field: FieldDef, value: string) {
		form = {
			...form,
			[field.key]: field.type === 'number' || field.type === 'currency' ? Number(value) || 0 : value
		};
	}

	async function handleSubmit() {
		for (const field of fields) {
			const value = form[field.key];
			if (field.required && (value === '' || value === null || value === undefined)) {
				alert(`${field.label} is required.`);
				return;
			}
		}
		const payload: Record<string, any> = {};
		for (const field of fields) {
			const value = form[field.key];
			payload[field.key] =
				field.type === 'number' || field.type === 'currency' ? Number(value) || 0 : value;
		}
		payload.description = textValue(form.description);
		await onSubmit(payload);
	}
</script>

<TransactionPageShell
	{title}
	{description}
	{backHref}
	{backLabel}
	{eyebrow}
	{documentNumber}
>
	<form on:submit|preventDefault={handleSubmit} class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
		<div class="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
			{#each fields as field}
				<div class={field.colSpan === 'full' ? 'sm:col-span-2' : ''}>
					<FormField label={field.label} name={field.key} required={field.required} hint={field.help ?? ''}>
						{#if field.type === 'select'}
							<select
								id={field.key}
								value={form[field.key] ?? ''}
								on:change={(event) => updateField(field, event.currentTarget.value)}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
							>
								{#each field.options ?? [] as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						{:else if field.type === 'textarea'}
							<textarea
								id={field.key}
								rows="3"
								value={form[field.key] ?? ''}
								placeholder={field.placeholder ?? ''}
								on:input={(event) => updateField(field, event.currentTarget.value)}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
							></textarea>
						{:else}
							<input
								id={field.key}
								type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'number' : field.type ?? 'text'}
								value={form[field.key] ?? ''}
								placeholder={field.placeholder ?? ''}
								required={field.required}
								on:input={(event) => updateField(field, event.currentTarget.value)}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
							/>
						{/if}
					</FormField>
				</div>
			{/each}
		</div>

		{#if !hasDescriptionField}
			<div class="mt-4">
				<FormField
					label="Description / Message"
					name="description"
					hint="Optional note copied into the audit trail for this transaction."
				>
					<textarea
						id="description"
						rows="3"
						placeholder="Explain the purpose of this transaction or the reason for the change..."
						bind:value={form.description}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
					></textarea>
				</FormField>
			</div>
		{/if}

		<div class="mt-2 flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
			<Button variant="secondary" href={backHref}>Cancel</Button>
			<Button variant="primary" type="submit">{submitLabel}</Button>
		</div>
	</form>

	{#if auditEntityType && auditEntityId}
		<AuditLogPanel entityType={auditEntityType} entityId={auditEntityId} />
	{/if}
</TransactionPageShell>
