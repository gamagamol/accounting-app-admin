<script lang="ts">
	import EntityCrudRoute from '$lib/components/transactions/EntityCrudRoute.svelte';
	import { customerReceiptDefinition } from '$lib/components/transactions/crudDefinitions';
	import { payments } from '$lib/stores/dataStore';
</script>

<EntityCrudRoute definition={customerReceiptDefinition} store={payments} />
