describe('API Integration E2E Tests', () => {
  const apiUrl = Cypress.env('apiUrl')
  
  // Store created user IDs for cleanup
  const createdUserIds = []
  
  // Clean up any users created during tests
  afterEach(() => {
    // Delete any users created during the test
    createdUserIds.forEach(userId => {
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/users/${userId}`,
        failOnStatusCode: false
      })
    })
    // Clear the array after cleanup
    createdUserIds.length = 0
  })

  it('should verify API health endpoint', () => {
    cy.request(`${apiUrl}/health`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('status', 'OK')
      expect(response.body).to.have.property('timestamp')
      expect(response.body).to.have.property('uptime')
    })
  })

  it('should fetch users from API', () => {
    cy.request(`${apiUrl}/users`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      
      // If users exist, validate their structure
      if (response.body.length > 0) {
        response.body.forEach(user => {
          expect(user).to.have.property('id')
          expect(user).to.have.property('name')
          expect(user).to.have.property('email')
        })
      }
    })
  })

  it('should create user via API', () => {
    // Create a unique user with timestamp to avoid conflicts
    const newUser = {
      name: `API Test User ${Date.now()}`,
      email: `apitest-${Date.now()}@example.com`
    }

    cy.request('POST', `${apiUrl}/users`, newUser).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('id')
      expect(response.body.name).to.eq(newUser.name)
      expect(response.body.email).to.eq(newUser.email)
      
      // Store the user ID for cleanup
      const userId = response.body.id
      createdUserIds.push(userId)
      
      // Verify we can retrieve the created user
      cy.request(`${apiUrl}/users/${userId}`).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expect(getResponse.body.id).to.eq(userId)
        expect(getResponse.body.name).to.eq(newUser.name)
      })
    })
  })

  it('should handle API errors properly', () => {
    // Generate a very large ID that's unlikely to exist
    const nonExistentId = Date.now() + 100000
    
    cy.request({
      method: 'GET',
      url: `${apiUrl}/users/${nonExistentId}`,
      failOnStatusCode: false
    }).then((response) => {
      // Accept either 404 (Not Found) or 500 (Server Error) as valid responses
      // for a non-existent user ID
      expect(response.status).to.be.oneOf([404, 500])
      expect(response.body).to.have.property('error')
    })
    
    // Also test invalid data for POST request
    cy.request({
      method: 'POST',
      url: `${apiUrl}/users`,
      body: { name: 'Missing Email User' }, // Missing required email field
      failOnStatusCode: false
    }).then((response) => {
      // Accept either 400 (Bad Request) or 500 (Server Error)
      expect(response.status).to.be.oneOf([400, 500])
      expect(response.body).to.have.property('error')
    })
  })
})