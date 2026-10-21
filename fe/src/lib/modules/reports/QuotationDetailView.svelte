<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { quotations } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { TableColumn } from '$lib/types';

  interface QuotationDetailItem {
    quotationNo: string;
    date: string;
    customerName: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    total: number;
  }

  $: detailRows = $quotations.flatMap((q) =>
    q.items.map((item) => ({
      quotationNo: q.quotationNo,
      date: q.date,
      customerName: q.customerName,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      discount: item.discount,
      total: item.total
    }))
  );

  const columns: TableColumn[] = [
    { key: 'quotationNo', label: 'No. Quotation', sortable: true },
    { key: 'date', label: 'Tanggal', sortable: true, format: (v) => formatDate(v) },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'productName', label: 'Nama Item Barang', sortable: true },
    { key: 'quantity', label: 'Qty', align: 'center', sortable: true },
    { key: 'unit', label: 'Satuan', align: 'center' },
    { key: 'unitPrice', label: 'Harga Satuan', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'discount', label: 'Diskon', align: 'center', format: (v) => v ? `${v}%` : '-' },
    { key: 'total', label: 'Total Nominal', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
  ];
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <p class="text-xs text-gray-500">Rincian line item seluruh penawaran harga yang diterbitkan</p>
    <Button variant="secondary" size="sm" on:click={() => window.print()}>
      🖨️ Cetak / Print Rincian
    </Button>
  </div>

  <DataTable
    {columns}
    data={detailRows}
    searchPlaceholder="Cari berdasarkan quotation, produk, atau customer..."
    searchKeys={['quotationNo', 'customerName', 'productName']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'quotationNo'}
        <span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {value}
        </span>
      {:else}
        {column.format ? column.format(value, row) : value}
      {/if}
    </svelte:fragment>
  </DataTable>
</div>
