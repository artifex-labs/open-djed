export default class Elements {
	container = () => cy.get('.flex.flex-col.gap-10.justify-center.items-center.w-full');
	title = () => cy.get('h1');
	effectiveDate = () => cy.get('p').contains('Effective Date');
	content = () => cy.get('.w-full.max-w-4xl');
}