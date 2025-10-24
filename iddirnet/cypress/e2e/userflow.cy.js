describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/signup', {
      statusCode: 200,
      body: { success: true },
    }).as('signupRequest');

    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: { success: true },
    }).as('loginRequest');

    cy.intercept('POST', '/api/logout', {
      statusCode: 200,
      body: { success: true },
    }).as('logoutRequest');

    cy.intercept('GET', '/payments*').as('paymentsRequest');

    cy.visit('/signup');
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Sign Up');
  });

  it('should submit the signup form successfully and navigate to login', () => {
    cy.get('#firstName').type('John');
    cy.get('#lastName').type('Doe');
    cy.get('#email').type('john.doe@example.com');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@signupRequest').its('request.body').should('deep.equal', {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    cy.url().should('include', '/login');
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Login');
  });

  it('should log in successfully and redirect to dashboard', () => {
    cy.visit('/login');
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Login');

    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    cy.url().should('include', '/dashboard');
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Dashboard');
  });

  it('should log out from dashboard and navigate to login', () => {
    cy.visit('/login');
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Login');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard');
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Dashboard');

    cy.get('button').contains('Logout').click();

    cy.then(() => {
      cy.get('@logoutRequest.all').then((interceptions) => {
        if (interceptions.length > 0) {
          cy.log('Logout API request occurred');
          expect(interceptions[0].response.statusCode).to.eq(200);
        } else {
          cy.log('No logout API request; assuming client-side logout');
        }
      });
    });

    cy.url().should('include', '/login');
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Login');
  });
});