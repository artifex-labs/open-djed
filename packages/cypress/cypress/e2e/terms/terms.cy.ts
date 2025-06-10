import Terms from "../../pages/terms/terms"

describe('Terms Test', () => {
  const terms: Terms = new Terms()
  
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      if (err.message.includes('Minified React error #418')) {
        return false
      }
      return true
    })

    cy.visit(terms.url)
  })

  it('should load the terms of service page', () => {
    terms.container().should('be.visible')
  })

  it('should display the terms of service title', () => {
    terms.title().should('be.visible').and('contain.text', 'Terms of Service')
  })

  it('should display the effective date', () => {
    terms.effectiveDate().should('be.visible').and('contain.text', 'May 15, 2025')
  })

  it('should redirect to the correct URL', () => {
    terms.content().contains('GNU General Public License v3.0').should('have.attr', 'href', 'https://www.gnu.org/licenses/gpl-3.0.html')
    terms.content().contains('github.com/artifex-labs/reverse-djed').should('have.attr', 'href', 'https://github.com/artifex-labs/reverse-djed')
    terms.content().contains('Discord').should('have.attr', 'href', 'https://discord.gg/MhYP7w8n8p')
  })
})