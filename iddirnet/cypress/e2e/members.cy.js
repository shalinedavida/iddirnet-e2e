describe('Members Page Tests', () => {
  const mockMembers = [
    { membership_id: 1, email: 'john.doe@example.com', role: 'member', created_at: '2023-01-01T00:00:00Z' },
    { membership_id: 2, email: 'jane.smith@example.com', role: 'leader', created_at: '2023-02-01T00:00:00Z' },
    { membership_id: 3, email: 'alice.johnson@example.com', role: 'member', created_at: '2023-03-01T00:00:00Z' },
  ];

  beforeEach(() => {
    cy.intercept('POST', '/api/login', { statusCode: 200, body: { success: true } }).as('login');
    cy.intercept('GET', '/api/memberships', { statusCode: 200, body: mockMembers }).as('getMembers');
    cy.intercept('GET', '/dashboard*', { statusCode: 200, body: {} }).as('dashboardRequest');
    cy.intercept('GET', '/iddirs*', { statusCode: 200, body: {} }).as('iddirsRequest');
    cy.intercept('GET', '/payments*', { statusCode: 200, body: {} }).as('paymentsRequest');

    cy.visit('/members');
    cy.wait('@getMembers', { timeout: 10000 });
  });

  it('renders the members page correctly', () => {
    cy.get('h1').should('contain.text', 'Members');
    cy.get('input[placeholder="Search by Name"]').should('be.visible');
    cy.get('#dropdown-toggle').should('contain.text', 'All Roles');
    cy.get('thead th').eq(0).should('contain.text', 'No.');
    cy.get('thead th').eq(1).should('contain.text', 'Member name');
    cy.get('thead th').eq(2).should('contain.text', 'Role');
    cy.get('thead th').eq(3).should('contain.text', 'Join date');
    cy.contains('Page 1 of 1').should('be.visible');
    cy.get('button').contains('Previous').should('be.disabled');
    cy.get('button').contains('Next').should('be.disabled');
  });

  it('displays member data correctly in the table', () => {
    cy.get('tbody tr').then(($rows) => {
      cy.log('Table rows:', $rows.length);
      cy.get('tbody').invoke('text').then((text) => {
        cy.log('Table content:', text);
      });
    });

    cy.get('tbody tr').should('have.length', 3);
    cy.get('tbody tr').first().within(() => {
      cy.get('td').eq(0).should('have.text', '1');
      cy.get('td').eq(1).should('contain.text', 'John.doe');
      cy.get('td').eq(2).should('contain.text', 'Member');
      cy.get('td').eq(3).invoke('text').should('match', /^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });
  });

  it('displays user-friendly error message when no members are found', () => {
    cy.intercept('GET', '/api/memberships', { statusCode: 200, body: [] }).as('emptyMembers');
    cy.visit('/members');
    cy.wait('@emptyMembers', { timeout: 10000 });
    cy.get('tbody tr td[colspan="4"]').should('contain.text', 'Member not available');
    cy.get('input[placeholder="Search by Name"]').type('NonExistent{enter}');
    cy.get('tbody tr td[colspan="4"]').should('contain.text', 'Member not available');
  });

  it('filters members by search term', () => {
    cy.get('input[placeholder="Search by Name"]').type('jane');
    cy.get('tbody tr').should('have.length', 1);
    cy.get('tbody tr td').eq(1).should('contain.text', 'Jane.smith');
  });

  it('handles pagination correctly (with more than 8 members)', () => {
    const manyMembers = Array.from({ length: 10 }, (_, i) => ({
      membership_id: i + 1,
      email: `user${i}@example.com`,
      role: 'member',
      created_at: '2023-01-01T00:00:00Z',
    }));

    cy.intercept('GET', '/api/memberships', { statusCode: 200, body: manyMembers }).as('getManyMembers');
    cy.visit('/members');
    cy.wait('@getManyMembers', { timeout: 10000 });

    cy.get('tbody tr').should('have.length', 8);
    cy.contains('Page 1 of 2').should('be.visible');
    cy.get('button').contains('Next').should('not.be.disabled');
    cy.get('button').contains('Next').click();
    cy.get('tbody tr').should('have.length', 2);
    cy.contains('Page 2 of 2').should('be.visible');
    cy.get('button').contains('Previous').should('not.be.disabled');
  });

  it('shows loading state', () => {
    cy.intercept('GET', '/api/memberships', (req) => {
      req.reply((res) => {
        res.delay = 1000; 
        res.send({ statusCode: 200, body: mockMembers });
      });
    }).as('getMembersDelayed');
    cy.visit('/members');
    cy.get('h3').should('contain.text', 'loading ...');
    cy.wait('@getMembersDelayed', { timeout: 10000 });
    cy.get('h3').should('not.exist');
    cy.get('table').should('be.visible');
  });

  it('shows error message if API fails', () => {
    cy.intercept('GET', '/api/memberships', {
      statusCode: 500,
      body: { error: 'Something went wrong,Internal Server Error' },
    }).as('getMembersError');
    cy.visit('/members');
    cy.wait('@getMembersError', { timeout: 10000 });
    cy.get('h3').should('contain.text', 'Something went wrong,Internal Server Error');
  });
});