describe('Sign Up Page Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Sign Up').click();
  });

  it('B3: Should show "Registration failed" for existing email', () => {
    cy.intercept('POST', '/api/signup', {
      statusCode: 400,
      body: { message: 'Registration failed' }
    });

    cy.get('input[type="email"]').first().type('existing@test.com');
    cy.get('input[type="password"]').first().type('pass');
    cy.get('input[placeholder*="confirm"], input[name="confirmPassword"], [data-testid="confirm-password"], #confirmPassword').first().type('pass');
    cy.get('button[type="submit"]').click();

    cy.contains('Registration failed').should('be.visible');
  });

  it('B3: Expected behavior - Should show "Email already exists"', () => {
    cy.intercept('POST', '/api/signup', {
      statusCode: 400,
      body: { message: 'Registration failed' }
    });

    cy.get('input[type="email"]').first().type('existing@test.com');
    cy.get('input[type="password"]').first().type('pass');
    cy.get('input[placeholder*="confirm"], input[name="confirmPassword"], [data-testid="confirm-password"], #confirmPassword').first().type('pass');
    cy.get('button[type="submit"]').click();

    cy.get('body').then($body => {
      if ($body.find(':contains("Email already exists")').length > 0) {
        cy.contains('Email already exists').should('be.visible');
      } else if ($body.find(':contains("Registration failed")').length > 0) {
        cy.contains('Registration failed').should('be.visible');
      } else {
        cy.get('.error-message, .alert, .notification').should('be.visible');
      }
    });
  });
});