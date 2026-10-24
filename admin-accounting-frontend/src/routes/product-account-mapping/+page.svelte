<script lang="ts">
	import EntityCrudList from '$lib/components/transactions/EntityCrudList.svelte';
	import { productAccountMappingDefinition } from '$lib/components/transactions/crudDefinitions';
	import { productAccountMappings } from '$lib/stores/dataStore';
</script>

<EntityCrudList definition={productAccountMappingDefinition} store={productAccountMappings} />
