// Custom commands for the application

Cypress.Commands.add('waitForApp', () => {
  // Visit the page
  cy.visit('/', { timeout: 10000 })
  
  // Wait for the app to load
  cy.contains('CICD Workshop - User Management', { timeout: 10000 }).should('be.visible')
  cy.get('[data-testid="user-form"]', { timeout: 10000 }).should('be.visible')
  
  // Wait for users to be displayed (this is more reliable than waiting for network requests)
  cy.get('[data-testid^="user-"]', { timeout: 10000 }).should('exist')
})

Cypress.Commands.add('addUser', (name, email) => {
  // Clear any existing values first
  cy.get('[data-testid="name-input"]').clear().type(name)
  cy.get('[data-testid="email-input"]').clear().type(email)
  
  // Submit the form
  cy.get('[data-testid="submit-button"]').click()
  
  // Wait for the success message or for the user to appear in the list
  cy.contains(name, { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('checkApiHealth', () => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/health`,
    failOnStatusCode: false,
    timeout: 10000 // Increase timeout for API health check
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.have.property('status', 'OK')
    
    // Log API health status for debugging
    cy.log(`API Health Check: ${response.body.status}, Uptime: ${response.body.uptime || 'N/A'}`)
  })
})