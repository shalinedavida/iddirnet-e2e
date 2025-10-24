describe('Sign Up Page Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Sign Up').click();
  });

  it('B3: Should show "Registration failed" for existing email (Current Behavior)', () => {
    cy.intercept('POST', '/api/signup', {
      statusCode: 400,
      body: { message: 'Registration failed' }
    }).as('signupRequest');

    cy.get('input[type="email"]').type('existing@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('input[placeholder="Confirm Password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@signupRequest');
    cy.contains('Registration failed').should('be.visible');
  });

  it('B3: Expected behavior - Should show "Email already exists" (Will fail until fixed)', () => {
    cy.intercept('POST', '/api/signup', {
      statusCode: 400,
      body: { message: 'Email already exists' }
    }).as('signupRequest');

    cy.get('input[type="email"]').type('existing@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('input[placeholder="Confirm Password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@signupRequest');
    cy.contains('Email already exists').should('be.visible');
  });
});