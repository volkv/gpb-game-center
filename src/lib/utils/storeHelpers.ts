import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import type { Screen, NavigationState } from '$lib/stores/navigationStore';

export function getStoreValue<T>(store: Readable<T>): T {
	let value: T;
	const unsubscribe = store.subscribe(v => value = v);
	unsubscribe();
	return value!;
}

export function createScreenDerivedStore(
	store: Readable<NavigationState>,
	screenName: Screen
) {
	return derived(store, $nav => $nav.currentScreen === screenName);
}