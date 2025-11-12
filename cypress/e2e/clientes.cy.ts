describe('Clientes CRUD', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/clientes')
  })

  it('debe crear, editar y eliminar un cliente', () => {

    cy.get('input[name="correo"]').type('admin@gmail.com')
    cy.get('input[name="password"]').type('tupassword')
    cy.get('button[data-test="my-button-test-tag"]').click()
    // Click en el botón "Clientes" del sidebar
    cy.get('button').contains('Clientes').click()

    // Crear cliente
    cy.contains('button', 'Agregar cliente').click()
    cy.get('input[name="nombre"]').type('Cliente Test')
    cy.get('input[name="correo"]').type('test@example.com')
    cy.get('input[name="telefono"]').type('1234567890')
    cy.get('input[name="direccion"]').type('Dirección Test')
    cy.contains('button', 'Guardar').click()
    cy.contains('Cliente Test').should('exist')

    // Editar cliente
    cy.get('tr').contains('Cliente Test')
      .parent('tr')
      .find('button')
      .first()
      .click()
    cy.get('input[name="nombre"]').clear().type('Cliente Test Editado')
    cy.get('input[name="correo"]').clear().type('test.edit@example.com')
    cy.contains('button', 'Guardar').click()
    cy.contains('Cliente Test Editado').should('exist')

    // Ver detalles y agregar mascota
    cy.contains('Cliente Test Editado').click()
    cy.contains('button', 'Agregar mascota').click()
    cy.get('input[name="nombre"]').type('Mascota Test')
    cy.get('input[name="especie"]').type('Perro')
    cy.get('input[name="raza"]').type('Labrador')
    cy.contains('button', 'Guardar').click()
    cy.contains('Mascota Test').should('exist')

    // Editar mascota
    cy.get('.rounded-lg').contains('Mascota Test')
      .parent('.flex gap-2')
      .find('button')
      .first()
      .click()
    cy.get('input[name="nombre"]').clear().type('Mascota Test Editada')
    cy.get('input[name="peso"]').type('15')
    cy.contains('button', 'Guardar').click()
    cy.contains('Mascota Test Editada').should('exist')

    // Eliminar mascota
    cy.get('.rounded-lg').contains('Mascota Test Editada')
      .parent('.rounded-lg')
      .find('button')
      .last()
      .click()
    cy.contains('button', 'Eliminar').click()
    cy.contains('Mascota Test Editada').should('not.exist')

    // Cerrar detalles
    cy.get('button[aria-label="Close"]').click()

    // Eliminar cliente
    cy.get('tr').contains('Cliente Test Editado')
      .parent('tr')
      .find('button')
      .last()
      .click()
    cy.contains('button', 'Eliminar').click()
    cy.contains('Cliente Test Editado').should('not.exist')
  })
})
