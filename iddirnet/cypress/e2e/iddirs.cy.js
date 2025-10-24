describe('Iddirs Page Tests', () => {
  const mockIddirs = [
    { iddir_name: 'Iddir A', address: '123 Main St', description: 'Community support group' },
    { iddir_name: 'Iddir B', address: '456 Oak Ave', description: 'Mutual aid society' },
    { iddir_name: 'Iddir C', address: '789 Pine Rd', description: 'Local cooperative' },
    { iddir_name: 'Iddir D', address: '101 Elm St', description: 'Support network' },
    { iddir_name: 'Iddir E', address: '202 Birch Ln', description: 'Community fund' },
    { iddir_name: 'Iddir F', address: '303 Cedar Dr', description: 'Social group' },
    { iddir_name: 'Iddir G', address: '404 Maple Ct', description: 'Aid organization' },
    { iddir_name: 'Iddir H', address: '505 Walnut St', description: 'Local support' },
    { iddir_name: 'Iddir I', address: '606 Spruce Ave', description: 'Cooperative group' },
  ];

  const mockError = 'Something went wrong, Internal Server Error';

  beforeEach(() => {
    cy.intercept('GET', '/api/iddirs', {
      statusCode: 200,
      body: mockIddirs,
    }).as('fetchIddirs');
   
    cy.intercept('GET', '/dashboard*', { statusCode: 200, body: {} }).as('dashboardRequest');
    cy.intercept('GET', '/members*', { statusCode: 200, body: {} }).as('membersRequest');
    cy.intercept('GET', '/payments*', { statusCode: 200, body: {} }).as('paymentsRequest');
   
    cy.visit('/iddirs');
  
    cy.get('h1').should('contain.text', 'Iddirs');
  });

  it('should render the Iddirs page with title, search input, and table', () => {
   
    cy.get('h1').should('contain.text', 'Iddirs').and('have.class', 'text-4xl');
    
    cy.get('input[placeholder="Search by Iddir"]').should('exist').and('have.value', '');
    
    cy.get('input[placeholder="Search by Iddir"]').parent().find('svg').should('exist'); 
    
    cy.get('table').within(() => {
      cy.get('thead tr th').eq(0).should('contain.text', 'No.');
      cy.get('thead tr th').eq(1).should('contain.text', 'Iddir name');
      cy.get('thead tr th').eq(2).should('contain.text', 'Location');
      cy.get('thead tr th').eq(3).should('contain.text', 'Description');
    });
   
    cy.get('tbody tr').should('have.length', 8);
    cy.get('tbody tr').eq(0).within(() => {
      cy.get('td').eq(0).should('contain.text', '1');
      cy.get('td').eq(1).should('contain.text', 'Iddir A');
      cy.get('td').eq(2).should('contain.text', '123 Main St');
      cy.get('td').eq(3).should('contain.text', 'Community support group');
    });
 
    cy.get('button').contains('Previous').should('have.class', 'opacity-50').and('be.disabled');
    cy.get('button').contains('Next').should('not.have.class', 'opacity-50').and('not.be.disabled');
    cy.get('span').contains('Page 1 of 2').should('exist');
  });

  it('should display loading state while fetching data', () => {
   
    cy.intercept('GET', '/api/iddirs', (req) => {
      req.reply((res) => {
        res.delay = 1000; 
        res.send({ statusCode: 200, body: mockIddirs });
      });
    }).as('fetchIddirsDelayed');
  
    cy.visit('/iddirs');
  
    cy.get('span').contains('Loading...').should('exist');
   
    cy.wait('@fetchIddirsDelayed', { timeout: 10000 });
   
    cy.get('tbody tr').should('have.length', 8);
  });

  it('should display error message on failed fetch', () => {

    cy.intercept('GET', '/api/iddirs', {
      statusCode: 500,
      body: { message: mockError },
    }).as('fetchIddirsError');
   
    cy.visit('/iddirs');
   
    cy.get('p.text-red-500').should('contain.text', `Error: ${mockError}`);
    
    cy.get('table').should('not.exist');
  });

  it('should display no results message when no iddirs match search', () => {
    cy.get('input[placeholder="Search by Iddir"]').type('NonExistent');
    
    cy.get('tbody tr').should('have.length', 1);
    cy.get('tbody tr td').should('contain.text', 'No iddirs found.');
  });

  it('should handle pagination correctly', () => {

    cy.get('tbody tr').should('have.length', 8);
    cy.get('tbody tr').eq(7).within(() => {
      cy.get('td').eq(0).should('contain.text', '8');
      cy.get('td').eq(1).should('contain.text', 'Iddir H');
    });
   
    cy.get('button').contains('Next').click();
   
    cy.get('tbody tr').should('have.length', 1); 
    cy.get('tbody tr').eq(0).within(() => {
      cy.get('td').eq(0).should('contain.text', '9');
      cy.get('td').eq(1).should('contain.text', 'Iddir I');
    });
    cy.get('span').contains('Page 2 of 2').should('exist');
    cy.get('button').contains('Next').should('have.class', 'opacity-50').and('be.disabled');
    cy.get('button').contains('Previous').should('not.have.class', 'opacity-50').and('not.be.disabled');
   
    cy.get('button').contains('Previous').click();
 
    cy.get('tbody tr').should('have.length', 8);
    cy.get('span').contains('Page 1 of 2').should('exist');
  });

  it('should reset to page 1 when search term changes', () => {
    
    cy.get('button').contains('Next').click();
    cy.get('span').contains('Page 2 of 2').should('exist');
    
    cy.get('input[placeholder="Search by Iddir"]').type('Iddir A');
    cy.get('span').contains('Page 1 of 1').should('exist');
    cy.get('tbody tr').should('have.length', 1);
  });

  it('should display correctly on mobile viewport', () => {
   
    cy.viewport('iphone-6'); 
   
    cy.get('h1').should('contain.text', 'Iddirs');
    cy.get('input[placeholder="Search by Iddir"]').should('be.visible');
   
    cy.get('div.overflow-x-auto').should('exist');
   
    cy.get('table').within(() => {
      cy.get('thead tr th').eq(0).should('contain.text', 'No.');
      cy.get('thead tr th').eq(1).should('contain.text', 'Iddir name');
    });
  
    cy.get('tbody tr').eq(0).within(() => {
      cy.get('td').eq(0).should('contain.text', '1');
      cy.get('td').eq(1).should('contain.text', 'Iddir A');
    });
    
    cy.get('button').contains('Previous').should('be.visible').and('be.disabled');
    cy.get('button').contains('Next').should('be.visible').and('not.be.disabled');
  });
});