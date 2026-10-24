<script lang="ts">
	import EntityCrudList from '$lib/components/transactions/EntityCrudList.svelte';
	import { customerReceiptDefinition } from '$lib/components/transactions/crudDefinitions';
	import { payments } from '$lib/stores/dataStore';
</script>

<EntityCrudList definition={customerReceiptDefinition} store={payments} />
