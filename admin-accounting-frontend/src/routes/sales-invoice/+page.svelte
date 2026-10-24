<script lang="ts">
	import EntityCrudList from '$lib/components/transactions/EntityCrudList.svelte';
	import { salesInvoiceDefinition } from '$lib/components/transactions/crudDefinitions';
	import { billPayments } from '$lib/stores/dataStore';
</script>

<EntityCrudList definition={salesInvoiceDefinition} store={billPayments} />
