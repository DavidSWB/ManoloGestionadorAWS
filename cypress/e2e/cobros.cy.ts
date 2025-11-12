describe('Cobros CRUD', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  it('debe crear, editar estado y eliminar un cobro', () => {
    // Login
    cy.get('input[name="correo"]').type('admin@gmail.com')
    cy.get('input[name="password"]').type('tupassword')
    cy.get('button[data-test="my-button-test-tag"]').click()
    // Click en el botón "Cobros" del sidebar
    cy.get('button').contains('Cobros').click()

    // Crear cobro
    cy.contains('button', 'Agregar cobro').click()
    cy.get('select[name="clienteId"]').select(1)
    cy.get('select[name="servicioId"]').select(1)
    cy.get('input[name="cantidad"]').clear().type('2')
    cy.contains('button', 'Guardar').click()

    // Verificar que se creó
    cy.get('tr').should('have.length.gt', 1)

    // Cambiar estado del cobro
    cy.get('tr').eq(1)
      .find('button')
      .first()
      .click()
    cy.get('button[role="menuitem"]')
      .contains('Pagado')
      .click()
    cy.get('tr').eq(1)
      .should('contain', 'pagado')

    // Ver comprobante
    cy.get('tr').eq(1)
      .find('button')
      .eq(1)
      .click()
    cy.contains('Comprobante de pago').should('exist')
    cy.get('button[aria-label="Close"]').click()

    // Eliminar cobro
    cy.get('tr').eq(1)
      .find('button')
      .last()
      .click()
    cy.contains('button', 'Eliminar').click()
    cy.get('tr').should('have.length', 1)
  })
})