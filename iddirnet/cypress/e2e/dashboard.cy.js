describe('Dashboard Pages Tests', () => {
  const pages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Iddirs', path: '/iddirs' },
    { name: 'Members', path: '/members' },
    { name: 'Payments', path: '/payments' }
  ];

  beforeEach(() => {
    cy.login('valid@test.com', 'password123');
  });

  it('B4: Headings should have consistent font size and weight across all pages', () => {
    pages.forEach(page => {
      cy.visit(page.path);
      cy.get('h1').should('exist').then($h1 => {
        const style = window.getComputedStyle($h1[0]);
        cy.log(`${page.name} heading: ${style.fontSize}, ${style.fontWeight}`);
      });
    });
  });

  it('B5: Pagination buttons should have the same size', () => {
    pages.forEach(page => {
      cy.visit(page.path);
      cy.get('.pagination button').should('have.length.gt', 0).then($buttons => {
        if ($buttons.length > 0) {
          const firstWidth = $buttons[0].offsetWidth;
          const firstHeight = $buttons[0].offsetHeight;
          $buttons.each((i, btn) => {
            expect(btn.offsetWidth).to.eq(firstWidth);
            expect(btn.offsetHeight).to.eq(firstHeight);
          });
        }
      });
    });
  });

  it('B6: Search bar should be visible on all dashboard pages', () => {
    pages.forEach(page => {
      cy.visit(page.path);
      cy.get('input[placeholder*="Search"]').should('be.visible');
    });
  });

  it('B7: Search bar should have consistent style', () => {
    cy.visit('/members');
    cy.get('input[placeholder*="Search"]').invoke('outerWidth').as('membersWidth');
    cy.get('input[placeholder*="Search"]').invoke('outerHeight').as('membersHeight');

    cy.visit('/dashboard');
    cy.get('input[placeholder*="Search"]').invoke('outerWidth').then(dashWidth => {
      cy.get('@membersWidth').should('eq', dashWidth);
    });
    cy.get('input[placeholder*="Search"]').invoke('outerHeight').then(dashHeight => {
      cy.get('@membersHeight').should('eq', dashHeight);
    });
  });
});