describe('Servicios CRUD', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/servicios')
  })

  it('debe crear, editar y eliminar un servicio', () => {
    cy.get('input[name="correo"]').type('admin@gmail.com')
    cy.get('input[name="password"]').type('tupassword')
    cy.get('button[data-test="my-button-test-tag"]').click()
    cy.get('button').contains('Servicios').click()

    // Crear servicio
    cy.contains('button', 'Nuevo servicio').click()
    cy.get('input[name="nombre"]').type('Servicio Test')
    cy.get('input[name="descripcion"]').type('Descripción del servicio test')
    cy.get('input[name="tarifa"]').type('50000')
    cy.contains('button', 'Guardar').click()
    cy.contains('Servicio Test').should('exist')

    // Editar servicio
    cy.get('tr').contains('Servicio Test')
      .parent('tr')
      .find('button')
      .first()
      .click()
    cy.get('input[name="nombre"]').clear().type('Servicio Test Editado')
    cy.get('input[name="tarifa"]').clear().type('60000')
    cy.contains('button', 'Guardar').click()
    cy.contains('Servicio Test Editado').should('exist')
    cy.contains('60000').should('exist')

    // Cambiar estado del servicio
    cy.get('tr').contains('Servicio Test Editado')
      .parent('tr')
      .find('button[role="switch"]')
      .click()
    cy.get('tr').contains('Servicio Test Editado')
      .parent('tr')
      .find('button[role="switch"][aria-checked="false"]')
      .should('exist')

    // Eliminar servicio
    cy.get('tr').contains('Servicio Test Editado')
      .parent('tr')
      .find('button')
      .last()
      .click()
    cy.contains('button', 'Eliminar').click()
    cy.contains('Servicio Test Editado').should('not.exist')
  })
})