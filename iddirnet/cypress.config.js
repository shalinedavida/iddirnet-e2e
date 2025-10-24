const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://iddirnet-beige.vercel.app",
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    supportFile: false,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});