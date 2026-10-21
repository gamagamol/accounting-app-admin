<script lang="ts">
    export let type: 'button' | 'submit' = 'button';
    export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
    
    const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors duration-200";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700"
    };
</script>

<button {type} class="{baseClasses} {variants[variant]}">
    <slot />
</button>