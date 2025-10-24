describe('Members Page Tests', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/login', { statusCode: 200 });
    cy.visit('/members');
  });

  it('B8: Error message should be user-friendly when member not found', () => {
    cy.intercept('GET', '/api/members?search=*', {
      statusCode: 200,
      body: { members: [] }
    });

    cy.get('input[placeholder*="search" i], input[placeholder*="Search" i], [data-testid="search-input"], .search-input').type('NonExistent{enter}');
    cy.contains(/member not available|no member found|no results/i).should('be.visible');
  });
});