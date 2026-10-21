function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num);
}
function getStatusColor(status) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    quotation: "bg-blue-100 text-blue-800",
    sales: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    delivered: "bg-green-100 text-green-800",
    shipped: "bg-cyan-100 text-cyan-800",
    received: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
export {
  formatCurrency as a,
  formatNumber as b,
  formatDate as f,
  getStatusColor as g
};
