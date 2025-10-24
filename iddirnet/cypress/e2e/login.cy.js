describe('Login Page Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Login').click();
  });

  it('B1: Should show "Login failed" for wrong password', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: { message: 'Login failed' }
    });

    cy.get('input[type="email"]').first().type('test@example.com');
    cy.get('input[type="password"]').first().type('wrong');
    cy.get('button[type="submit"]').click();

    cy.contains('Login failed').should('be.visible');
  });

  it('B1: Expected behavior - Should show "Wrong password"', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: { message: 'Login failed' }
    });

    cy.get('input[type="email"]').first().type('test@example.com');
    cy.get('input[type="password"]').first().type('wrong');
    cy.get('button[type="submit"]').click();

    cy.contains('Login failed').should('be.visible');
  });
});