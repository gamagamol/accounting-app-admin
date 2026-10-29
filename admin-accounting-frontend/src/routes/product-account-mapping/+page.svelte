<script lang="ts">
	import EntityCrudList from '$lib/components/transactions/EntityCrudList.svelte';
	import { buildProductAccountMappingDefinition } from '$lib/components/transactions/crudDefinitions';
	import { productAccountMappings, productCategories } from '$lib/stores/dataStore';

	$: definition = buildProductAccountMappingDefinition($productCategories);
</script>

<EntityCrudList {definition} store={productAccountMappings} />
