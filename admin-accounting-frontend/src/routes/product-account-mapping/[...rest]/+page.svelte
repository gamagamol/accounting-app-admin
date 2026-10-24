<script lang="ts">
	import EntityCrudRoute from '$lib/components/transactions/EntityCrudRoute.svelte';
	import { productAccountMappingDefinition } from '$lib/components/transactions/crudDefinitions';
	import { productAccountMappings } from '$lib/stores/dataStore';
</script>

<EntityCrudRoute definition={productAccountMappingDefinition} store={productAccountMappings} />
