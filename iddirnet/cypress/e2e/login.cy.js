
describe('Login Page Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Login').click();
  });

  it('renders the login page correctly', () => {
    cy.get('body').then(($body) => {
      if ($body.find('img[alt="IddirNet Logo"]').length > 0) {
        cy.get('img[alt="IddirNet Logo"]').should('be.visible');
      } else {
        cy.log('Logo not found, likely on small screen');
      }

      cy.get('h1.text-5xl.font-bold').should('have.text', 'Login');

      cy.get('form').within(() => {
        cy.get('label[for="email"]').should('have.text', 'Email');
        cy.get('input#email').should('have.attr', 'placeholder', 'Enter email').and('have.attr', 'type', 'email');
        cy.get('label[for="password"]').should('have.text', 'Password');
        cy.get('input#password').should('have.attr', 'placeholder', 'Password').and('have.attr', 'type', 'password');
        cy.get('button[aria-label="Show password"]').should('exist').and('be.visible');
        cy.get('button[type="submit"]').should('have.text', 'Sign In');
      });

      cy.get('a[href="/signup"]').should('have.text', 'Sign up').and('be.visible');
    });
  });


  it('B1: shows "Login failed: Unauthorized" for wrong password', () => {
    cy.intercept('POST', '/api/login', { statusCode: 401, body: { message: 'Login failed: Unauthorized' } }).as('loginFailure');
    cy.get('input#email').type('test@example.com');
    cy.get('input#password').type('wrong');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginFailure');
    cy.get('p.text-red-600').should('have.text', 'Login failed: Unauthorized');
  });

  it('toggles password visibility', () => {
    cy.get('input#password').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Show password"]').click();
    cy.get('input#password').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Hide password"]').click();
    cy.get('input#password').should('have.attr', 'type', 'password');
  });

  it('displays alert for empty form submission', () => {
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Please fill in all fields.');
    });
    cy.get('button[type="submit"]').click();
  });
  
  it('submits the form successfully and redirects to dashboard', () => {
    cy.intercept('POST', '/api/login', { statusCode: 200, body: { success: true } }).as('loginSuccess');
    cy.get('input#email').type('test@example.com');
    cy.get('input#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginSuccess');
    cy.url().should('include', '/dashboard');
  });
});