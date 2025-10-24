describe('PaymentsPage', () => {
  const mockPayments = [
    { payment_id: 1, user: 1, payment_type: 'credit', amount: 1000 },
    { payment_id: 2, user: 2, payment_type: 'debit', amount: 2000 },
    { payment_id: 3, user: 1, payment_type: 'credit', amount: 1500 },
  ];

  const mockUsers = [
    { user_id: 1, first_name: 'John' },
    { user_id: 2, first_name: 'Jane' },
  ];

  beforeEach(() => {
    cy.intercept('GET', '/api/payment', {
      statusCode: 200,
      body: mockPayments,
    }).as('fetchPayments');

    cy.intercept('GET', '/api/user', {
      statusCode: 200,
      body: mockUsers,
    }).as('fetchUsers');

    cy.visit('/payments');
    cy.get('h1').should('contain.text', 'Payments');
  });

  it('should render the PaymentsPage with title and search input', () => {
    cy.get('h1').should('contain.text', 'Payments');
    cy.get('input[placeholder="Search by name"]').should('be.visible');
    cy.get('svg.text-gray-400').should('be.visible'); 
  });

  it('should display loading state', () => {
    cy.intercept('GET', '/api/payment', (req) => {
      req.reply((res) => {
        res.delay = 1000; 
        res.send({ statusCode: 200, body: mockPayments });
      });
    }).as('fetchPaymentsDelayed');

    cy.visit('/payments');
    cy.get('p.text-gray-600').should('contain.text', 'loading ...');
    cy.wait('@fetchPaymentsDelayed', { timeout: 10000 }); 
    cy.get('p.text-gray-600').should('not.exist'); 
  });

  it('should display error state', () => {
    cy.intercept('GET', '/api/payment', {
      statusCode: 500,
      body: { message: 'Failed to fetch payments' },
    }).as('fetchPaymentsError');

    cy.visit('/payments');
    cy.wait('@fetchPaymentsError', { timeout: 10000 });
    cy.get('p.text-red-500').should('contain.text', 'Failed to fetch payments');
  });

  it('should display payments table with correct data', () => {
    cy.wait('@fetchPayments', { timeout: 10000 });
    cy.wait('@fetchUsers', { timeout: 10000 });

    cy.get('thead th').should('have.length', 5);
    cy.get('thead th').eq(0).should('contain.text', 'No.');
    cy.get('thead th').eq(1).should('contain.text', 'User Name');
    cy.get('thead th').eq(2).should('contain.text', 'Type');
    cy.get('thead th').eq(3).should('contain.text', 'Payment ID');
    cy.get('thead th').eq(4).should('contain.text', 'Amount');

    cy.get('tbody tr').should('have.length', 3); 
    cy.get('tbody tr').eq(0).within(() => {
      cy.get('td').eq(0).should('contain.text', '1');
      cy.get('td').eq(1).should('contain.text', 'John');
      cy.get('td').eq(2).should('contain.text', 'Credit');
      cy.get('td').eq(3).should('contain.text', '1');
      cy.get('td').eq(4).should('contain.text', '1,000 birr');
    });
    cy.get('tbody tr').eq(1).within(() => {
      cy.get('td').eq(0).should('contain.text', '2');
      cy.get('td').eq(1).should('contain.text', 'Jane');
      cy.get('td').eq(2).should('contain.text', 'Debit');
      cy.get('td').eq(3).should('contain.text', '2');
      cy.get('td').eq(4).should('contain.text', '2,000 birr');
    });
  });

  it('should filter payments by search term', () => {
    cy.wait('@fetchPayments', { timeout: 10000 });
    cy.wait('@fetchUsers', { timeout: 10000 });

    cy.get('input[placeholder="Search by name"]').type('John');
    cy.get('tbody tr').should('have.length', 2); 
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(1).should('contain.text', 'John');
    });

    cy.get('input[placeholder="Search by name"]').clear();
    cy.get('tbody tr').should('have.length', 3); 

    cy.get('input[placeholder="Search by name"]').type('Nonexistent');
    cy.get('tbody tr').should('have.length', 1);
    cy.get('tbody tr td').should('contain.text', 'Payments not available');
  });

  it('should handle pagination correctly', () => {
    const morePayments = Array.from({ length: 10 }, (_, i) => ({
      payment_id: i + 1,
      user: (i % 2) + 1, 
      payment_type: i % 2 === 0 ? 'credit' : 'debit',
      amount: 1000 * (i + 1),
    }));

    cy.intercept('GET', '/api/payment', {
      statusCode: 200,
      body: morePayments,
    }).as('fetchMorePayments');

    cy.visit('/payments');
    cy.wait('@fetchMorePayments', { timeout: 10000 });
    cy.wait('@fetchUsers', { timeout: 10000 });

    cy.get('tbody tr').should('have.length', 8);
    cy.get('span').should('contain.text', 'Page 1 of 2');
    cy.get('button').contains('Previous').should('have.class', 'opacity-50');

    cy.get('button').contains('Next').click();
    cy.get('tbody tr').should('have.length', 2); 
    cy.get('span').should('contain.text', 'Page 2 of 2');
    cy.get('button').contains('Next').should('have.class', 'opacity-50');

    cy.get('button').contains('Previous').click();
    cy.get('tbody tr').should('have.length', 8);
    cy.get('span').should('contain.text', 'Page 1 of 2');
  });

  it('should display "Payments not available" when no payments exist', () => {
    cy.intercept('GET', '/api/payment', {
      statusCode: 200,
      body: [],
    }).as('fetchEmptyPayments');

    cy.visit('/payments');
    cy.wait('@fetchEmptyPayments', { timeout: 10000 });
    cy.wait('@fetchUsers', { timeout: 10000 });

    cy.get('tbody tr').should('have.length', 1);
    cy.get('tbody tr td').should('contain.text', 'Payments not available');
  });
});