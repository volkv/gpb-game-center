export interface LazyLoader<T> {
	load(importFn: () => Promise<{ default: T }>): Promise<T>;
	component: T | null;
	isLoading: boolean;
}

export function createLazyLoader<T>(): LazyLoader<T> {
	let loader = $state<{ component: T | null; isLoading: boolean }>({
		component: null,
		isLoading: false
	});

	let promise: Promise<void> | null = null;

	return {
		async load(importFn: () => Promise<{ default: T }>) {
			if (loader.component) return loader.component;
			if (promise) {
				await promise;
				return loader.component!;
			}

			loader.isLoading = true;
			promise = importFn()
				.then(module => {
					loader.component = module.default;
				})
				.finally(() => {
					loader.isLoading = false;
					promise = null;
				});

			await promise;
			return loader.component!;
		},
		get component() {
			return loader.component;
		},
		get isLoading() {
			return loader.isLoading;
		}
	};
}