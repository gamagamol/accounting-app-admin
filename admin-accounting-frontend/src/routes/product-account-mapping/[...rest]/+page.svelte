<script lang="ts">
	import EntityCrudRoute from '$lib/components/transactions/EntityCrudRoute.svelte';
	import { buildProductAccountMappingDefinition } from '$lib/components/transactions/crudDefinitions';
	import { productAccountMappings, productCategories } from '$lib/stores/dataStore';

	$: definition = buildProductAccountMappingDefinition($productCategories);
</script>

<EntityCrudRoute {definition} store={productAccountMappings} />
