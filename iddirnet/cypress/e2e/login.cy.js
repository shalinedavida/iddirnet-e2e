describe('Login Page Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Login').click();
  });

  it('B1: Should show "Login failed" for wrong password (Current Behavior)', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: { message: 'Login failed' }
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('wrong-password');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.contains('Login failed').should('be.visible');
  });

  it('B1: Expected behavior - Should show "Wrong password" (Will fail until fixed)', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: { message: 'Wrong password' }
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('wrong-password');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.contains('Wrong password').should('be.visible');
  });
});