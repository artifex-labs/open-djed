import Elements from './homeElements';

export default class Home extends Elements {
	readonly url: string = '/'; // URL of the page
	readonly fixturesPath: string = 'home'; // Fixtures subfolder where the translations for this object is stored
}