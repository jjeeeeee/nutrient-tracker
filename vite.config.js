export default defineConfig({
  server: {
    proxy: {
      "/api": "https://nutrient-tracker-backend-c0o9.onrender.com",  // Adjust this to your backend URL
    },
  },
});