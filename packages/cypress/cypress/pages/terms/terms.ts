import Elements from './termsElements';

export default class Terms extends Elements {
	readonly url: string = '/terms'; // URL of the page
	readonly fixturesPath: string = 'terms'; // Fixtures subfolder where the translations for this object is stored
}