Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.contains('Login').click();
  cy.url().should('include', '/login');

  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();

  cy.url({ timeout: 10000 }).should('include', '/dashboard');
});

Cypress.Commands.add('navigateToPage', (pageName) => {
  cy.contains(pageName).click();
  cy.url().should('include', `/${pageName.toLowerCase()}`);
});