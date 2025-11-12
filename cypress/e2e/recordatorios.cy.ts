describe('Recordatorios CRUD', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  it('debe crear y ver un recordatorio', () => {
    // Login
    cy.get('input[name="correo"]').type('admin@gmail.com')
    cy.get('input[name="password"]').type('tupassword')
    cy.get('button[data-test="my-button-test-tag"]').click()
    // Click en el botón "Recordatorios" del sidebar
    cy.get('button').contains('Recordatorios').click()

    // Crear recordatorio
    cy.contains('button', 'Enviar recordatorio').click()
    cy.get('select[name="clienteId"]').select(1)
    cy.get('select[name="medio"]').select('Email')
    cy.get('input[name="asunto"]').clear().type('Recordatorio Test')
    cy.get('textarea[name="mensaje"]').clear().type('Este es un recordatorio de prueba')
    cy.contains('button', 'Enviar').click()

    // Verificar que se creó
    cy.contains('Recordatorio Test').should('exist')
    cy.get('tr').eq(1).within(() => {
      cy.get('td').eq(0).should('not.be.empty') // Cliente
      cy.get('td').eq(1).should('contain', 'Email') // Medio
      cy.get('td').eq(2).should('not.be.empty') // Fecha
      cy.get('td').eq(3).should('contain', 'enviado') // Estado
    })
  })
})