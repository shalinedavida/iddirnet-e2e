describe('SignupPage Tests', () => {
  const mockSuccessRegisterResponse = true;
  const mockErrorRegisterResponse = { message: 'Registration failed: Bad Request' }; 

  beforeEach(() => {
    cy.intercept('POST', '/api/signup', {
      statusCode: 200,
      body: mockSuccessRegisterResponse,
    }).as('registerRequest');
    cy.intercept('GET', '/login*', { statusCode: 200, body: {} }).as('loginRequest');
    cy.visit('/signup');
    cy.get('h1').should('contain.text', 'Sign Up');
  });

  it('should render the SignupPage with title, form, and logo', () => {
    cy.get('h1').should('contain.text', 'Sign Up');
    cy.get('form').within(() => {
      cy.get('label').eq(0).should('contain.text', 'First name');
      cy.get('input#firstName').should('have.attr', 'placeholder', 'Enter first name').and('have.attr', 'type', 'text');
      cy.get('label').eq(1).should('contain.text', 'Last name');
      cy.get('input#lastName').should('have.attr', 'placeholder', 'Enter last name').and('have.attr', 'type', 'text');
      cy.get('label').eq(2).should('contain.text', 'Email');
      cy.get('input#email').should('have.attr', 'placeholder', 'Enter email').and('have.attr', 'type', 'email');
      cy.get('label').eq(3).should('contain.text', 'Create Password');
      cy.get('input#password').should('have.attr', 'placeholder', 'Password').and('have.attr', 'type', 'password');
      cy.get('label').eq(4).should('contain.text', 'Confirm Password');
      cy.get('input#confirmPassword').should('have.attr', 'placeholder', 'Password').and('have.attr', 'type', 'password');
      cy.get('button[type="submit"]').should('contain.text', 'Create account');
    });
    cy.get('a').should('contain.text', 'Sign In').and('have.attr', 'href', '/login');
    cy.get('img[alt="IddirNet Logo"]').should('be.visible').and('have.attr', 'src').and('include', 'iddirnet-logo');
  });

  it('should toggle password visibility for both password fields', () => {
    cy.get('input#password').should('have.attr', 'type', 'password');
    cy.get('input#confirmPassword').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Show password"]').click();
    cy.get('input#password').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Hide password"] svg').should('exist');
    cy.get('button[aria-label="Show confirm password"]').click();
    cy.get('input#confirmPassword').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Hide confirm password"] svg').should('exist');
    cy.get('button[aria-label="Hide password"]').click();
    cy.get('input#password').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Show password"] svg').should('exist');
    cy.get('button[aria-label="Hide confirm password"]').click();
    cy.get('input#confirmPassword').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Show confirm password"] svg').should('exist');
  });

  it('should display validation error for mismatched passwords', () => {
    cy.get('input#firstName').type('John');
    cy.get('input#lastName').type('Doe');
    cy.get('input#email').type('john.doe@example.com');
    cy.get('input#password').type('password123');
    cy.get('input#confirmPassword').type('password456');
    cy.get('p.text-red-600').should('contain.text', 'Passwords do not match.');
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    cy.get('@registerRequest').should('not.exist');
    cy.get('input#confirmPassword').clear().type('password123');
    cy.get('p.text-red-600').should('not.exist');
  });


  it('should display error message on failed registration', () => {
    cy.intercept('POST', '/api/signup', {
      statusCode: 400,
      body: mockErrorRegisterResponse,
    }).as('registerRequestFailed');
    cy.get('input#firstName').type('John');
    cy.get('input#lastName').type('Doe');
    cy.get('input#email').type('john.doe@example.com');
    cy.get('input#password').type('password123');
    cy.get('input#confirmPassword').type('password123');
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });

    cy.wait('@registerRequestFailed', { timeout: 10000 });
  
    cy.get('p.text-red-600').should('contain.text', 'Registration failed: Bad Request');
  
    cy.url().should('include', '/signup');
  });

  it('should disable submit button and show loading state', () => {
    
    cy.intercept('POST', '/api/signup', (req) => {
      req.reply((res) => {
        res.delay = 2000; 
        res.send({ statusCode: 200, body: mockSuccessRegisterResponse });
      });
    }).as('registerRequestDelayed');
  
    cy.get('input#firstName').type('John');
    cy.get('input#lastName').type('Doe');
    cy.get('input#email').type('john.doe@example.com');
    cy.get('input#password').type('password123');
    cy.get('input#confirmPassword').type('password123');
 
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    
      cy.get('button[type="submit"]').should('be.disabled');
  
    });

    cy.wait('@registerRequestDelayed', { timeout: 10000 });
  
    cy.url().should('include', '/login');
  });

  it('should hide logo on mobile viewport', () => {
  
    cy.viewport('iphone-6'); 
  
    cy.get('img[alt="IddirNet Logo"]').should('not.be.visible');

    cy.get('h1').should('contain.text', 'Sign Up');
    cy.get('input#firstName').should('be.visible');
    cy.get('input#lastName').should('be.visible');
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.get('input#confirmPassword').should('be.visible');
  });
    it('should submit the form successfully and navigate to login', () => {
    cy.get('input#firstName').type('John');
    cy.get('input#lastName').type('Doe');
    cy.get('input#email').type('john.doe@example.com');
    cy.get('input#password').type('password123');
    cy.get('input#confirmPassword').type('password123');
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    cy.wait('@registerRequest', { timeout: 10000 }).its('request.body').should('deep.equal', {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });
    cy.wait('@loginRequest', { timeout: 10000 });
    cy.url().should('include', '/login');
  });
});