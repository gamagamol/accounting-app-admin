<script lang="ts">
    export let columns: { key: string, label: string }[];
    export let data: any[];
</script>

<div class="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                {#each columns as col}
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col.label}
                    </th>
                {/each}
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                </th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            {#each data as row}
                <tr>
                    {#each columns as col}
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[col.key]}
                        </td>
                    {/each}
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>