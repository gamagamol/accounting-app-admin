<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { appSettings } from '$lib/stores/dataStore';

	export let isOpen: boolean = false;
	export let title: string = 'Print Document';
	export let documentType:
		| 'quotation'
		| 'sales'
		| 'purchase'
		| 'delivery'
		| 'bill'
		| 'payment'
		| 'sticker' = 'quotation';
	export let documentNo: string = '';
	export let date: string = '';
	export let customerOrSupplierName: string = '';
	export let address: string = '';
	export let items: any[] = [];
	export let subtotal: number = 0;
	export let tax: number = 0;
	export let total: number = 0;
	export let notes: string = '';
	export let preparedBy: string = '';

	function handlePrint() {
		window.print();
	}

	$: documentLabel =
		documentType === 'quotation'
			? 'QUOTATION'
			: documentType === 'sales'
				? 'SALES ORDER'
				: documentType === 'purchase'
					? 'PURCHASE ORDER'
					: documentType === 'delivery'
						? 'DELIVERY ORDER'
						: documentType === 'bill'
							? 'SALES INVOICE'
							: documentType === 'payment'
								? 'PAYMENT RECEIPT'
								: 'SHIPPING LABEL';
</script>

<Modal bind:isOpen {title} size="4xl">
	<div class="print:p-0 p-2 sm:p-4 max-h-[75vh] overflow-y-auto">
		<!-- Printable Document Frame -->
		<div
			id="printable-area"
			class="print-sheet bg-white border border-gray-300 p-5 sm:p-8 shadow-sm text-gray-900 font-sans"
		>
			<!-- Header -->
			<div class="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-gray-900 pb-4 mb-6">
				<div>
					<h1 class="text-xl sm:text-2xl font-black tracking-tight text-blue-900 uppercase">
						{$appSettings.companyName}
					</h1>
					<p class="text-xs text-gray-600 mt-1 max-w-sm">{$appSettings.companyAddress}</p>
					<p class="text-xs text-gray-600">Phone: {$appSettings.companyPhone} | Email: {$appSettings.companyEmail}</p>
					<p class="text-xs text-gray-600 font-mono">Tax ID: {$appSettings.companyNpwp}</p>
				</div>
				<div class="sm:text-right">
					<span class="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
						{documentLabel}
					</span>
					<p class="text-base font-bold text-gray-800 mt-2 font-mono">{documentNo}</p>
					<p class="text-xs text-gray-500">Date: {date ? formatDate(date) : '-'}</p>
				</div>
			</div>

			<!-- Parties Info -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
				<div class="border rounded-lg p-3 bg-gray-50">
					<p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
						{#if documentType === 'purchase'}
							To Supplier / Vendor:
						{:else}
							To Customer:
						{/if}
					</p>
					<p class="font-bold text-gray-900 text-base">{customerOrSupplierName || '-'}</p>
					{#if address}
						<p class="text-xs text-gray-600 mt-1">{address}</p>
					{/if}
				</div>
				<div class="border rounded-lg p-3 bg-gray-50">
					<p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction Information:</p>
					<div class="grid grid-cols-2 gap-1 text-xs">
						<span class="text-gray-500">Document No:</span>
						<span class="font-semibold text-gray-800 font-mono">{documentNo}</span>
						<span class="text-gray-500">Prepared by:</span>
						<span class="font-semibold text-gray-800">{preparedBy || '-'}</span>
						<span class="text-gray-500">Currency:</span>
						<span class="font-semibold text-gray-800">{$appSettings.currency}</span>
					</div>
				</div>
			</div>

			<!-- Items Table -->
			{#if documentType !== 'payment' && items && items.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full text-xs border border-gray-300 mb-6">
						<thead class="bg-slate-100 border-b border-gray-300">
							<tr>
								<th class="p-2 border-r border-gray-300 text-center w-10">No</th>
								<th class="p-2 border-r border-gray-300 text-left">Product / Service</th>
								<th class="p-2 border-r border-gray-300 text-center w-20">Qty</th>
								<th class="p-2 border-r border-gray-300 text-center w-16">Unit</th>
								{#if documentType !== 'delivery' && documentType !== 'sticker'}
									<th class="p-2 border-r border-gray-300 text-right w-28">Unit Price</th>
									<th class="p-2 border-r border-gray-300 text-right w-20">Disc.</th>
									<th class="p-2 text-right w-32">Total</th>
								{/if}
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each items as item, i}
								<tr>
									<td class="p-2 border-r border-gray-300 text-center font-mono">{i + 1}</td>
									<td class="p-2 border-r border-gray-300 font-medium">{item.productName || item.name}</td>
									<td class="p-2 border-r border-gray-300 text-center">{item.quantity}</td>
									<td class="p-2 border-r border-gray-300 text-center text-gray-600">{item.unit || 'Pcs'}</td>
									{#if documentType !== 'delivery' && documentType !== 'sticker'}
										<td class="p-2 border-r border-gray-300 text-right font-mono">
											{formatCurrency(item.unitPrice || item.price || 0)}
										</td>
										<td class="p-2 border-r border-gray-300 text-right">{item.discount ? item.discount + '%' : '-'}</td>
										<td class="p-2 text-right font-mono font-semibold">
											{formatCurrency(item.total || item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100))}
										</td>
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- Totals / Payment Summary -->
			{#if documentType !== 'delivery' && documentType !== 'sticker'}
				<div class="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 text-xs">
					<div class="flex-1">
						<p class="font-bold text-gray-700 mb-1">Notes / Terms:</p>
						<p class="text-gray-600 italic bg-gray-50 p-2.5 rounded border border-gray-200">
							{notes ||
								'Thank you for your business. This document is valid and officially generated by the accounting system.'}
						</p>
					</div>
					<div class="w-full sm:w-64 space-y-1.5 border border-gray-300 rounded p-3 bg-gray-50">
						<div class="flex justify-between text-gray-600">
							<span>Subtotal:</span>
							<span class="font-mono font-semibold">{formatCurrency(subtotal || total)}</span>
						</div>
						{#if tax > 0}
							<div class="flex justify-between text-gray-600">
								<span>VAT 11%:</span>
								<span class="font-mono font-semibold">{formatCurrency(tax)}</span>
							</div>
						{/if}
						<div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-1.5 mt-1.5">
							<span>Total:</span>
							<span class="font-mono text-blue-900">{formatCurrency(total || subtotal)}</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Signatures Area -->
			<div class="grid grid-cols-3 gap-4 text-center text-xs pt-4 border-t border-gray-200">
				<div>
					<p class="text-gray-500 mb-16">Prepared by,</p>
					<p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[100px]">
						{preparedBy || 'Administration Staff'}
					</p>
				</div>
				<div>
					<p class="text-gray-500 mb-16">Reviewed by / Finance,</p>
					<p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[100px]">Supervisor</p>
				</div>
				<div>
					<p class="text-gray-500 mb-16">Received / Approved,</p>
					<p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[100px]">
						{customerOrSupplierName || 'Authorized Party'}
					</p>
				</div>
			</div>
		</div>
	</div>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
		<Button variant="primary" on:click={handlePrint}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
				/>
			</svg>
			Print
		</Button>
	</svelte:fragment>
</Modal>
