describe('Members Page Tests', () => {
  beforeEach(() => {
    cy.login('valid@test.com', 'password123');
    cy.visit('/members');
  });

  it('B8: Error message should be user-friendly when member not found', () => {
    cy.intercept('GET', '/api/members?search=*', {
      statusCode: 200,
      body: { members: [] }
    }).as('search');

    cy.get('input[placeholder="Search by Name"]').type('NonExistent{enter}');
    cy.wait('@search');

    cy.contains('member not available').should('be.visible');
    cy.contains('Member not found').should('be.visible');
  });
});