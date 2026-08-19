import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@food-replacements/favorites';

// Os itens completos ficam salvos para que a tela possa funcionar sem rede.
export async function getFavorites() {
	try {
		const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
		const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
		return Array.isArray(favorites) ? favorites : [];
	} catch (error) {
		console.warn('Nao foi possivel carregar os favoritos.', error);
		return [];
	}
}

export async function toggleFavorite(item) {
	if (!item || item.id === undefined || item.id === null) {
		return { isFavorite: false, favorites: await getFavorites() };
	}

	const favorites = await getFavorites();
	const alreadyFavorite = favorites.some((favorite) => String(favorite.id) === String(item.id));
	const updatedFavorites = alreadyFavorite
		? favorites.filter((favorite) => String(favorite.id) !== String(item.id))
		: [...favorites, item];

	try {
		await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
	} catch (error) {
		console.warn('Nao foi possivel salvar os favoritos.', error);
	}

	return { isFavorite: !alreadyFavorite, favorites: updatedFavorites };
}

export async function isFavorite(itemOrId) {
	const id = typeof itemOrId === 'object' ? itemOrId?.id : itemOrId;
	if (id === undefined || id === null) return false;
	const favorites = await getFavorites();
	return favorites.some((favorite) => String(favorite.id) === String(id));
}
