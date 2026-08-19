import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FoodCard from '../components/FoodCard';
import localFoodReplacements from '../data/foodReplacements';
import { getFavorites } from '../services/favorites';
import supabase, { hasSupabaseConfig } from '../services/supabase';

const filters = ['Todos', 'Carboidratos', 'Sódio', 'Favoritos'];

function searchable(value) {
	return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function categoryMatches(itemCategory, selectedCategory) {
	if (selectedCategory === 'Todos' || selectedCategory === 'Favoritos') return true;
	const itemValue = searchable(itemCategory);
	const selectedValue = searchable(selectedCategory);
	return itemValue === selectedValue || itemValue.replace(/s$/, '') === selectedValue.replace(/s$/, '');
}

function normalizeItem(item) {
	return { ...item, id: item.id ?? `${item.original_food}-${item.substitute}`, original_food: item.original_food || item.original, substitute: item.substitute || item.replacement };
}

export default function FoodCalculatorScreen() {
	const [items, setItems] = useState([]);
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState('Todos');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	async function loadItems() {
		setLoading(true);
		setError('');
		const savedFavorites = await getFavorites();

		if (filter === 'Favoritos') {
			setItems(savedFavorites);
			setLoading(false);
			return;
		}

		if (!hasSupabaseConfig) {
			setItems(localFoodReplacements);
			setError('Modo offline: configure o Supabase para usar dados remotos.');
		} else {
			const { data, error: queryError } = await supabase.from('food_replacements').select('*');
			if (queryError || !data) {
				setItems(localFoodReplacements);
				setError('Sem conexao: exibindo dados locais.');
			} else {
				setItems(data.map(normalizeItem));
			}
		}
		setLoading(false);
	}

	useEffect(() => { loadItems(); }, [filter]);

	const visibleItems = items.filter((item) => {
		const text = `${item.original_food || ''} ${item.substitute || ''}`;
		return searchable(text).includes(searchable(search).trim()) && categoryMatches(item.category, filter);
	});

	async function handleFavoriteChange(updatedFavorites) {
		if (filter === 'Favoritos') setItems(updatedFavorites);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.eyebrow}>NUTRICAO INTELIGENTE</Text>
				<Text style={styles.title}>Calculadora de alimentos</Text>
				<Text style={styles.subtitle}>Encontre trocas simples para sua rotina.</Text>
			</View>
			<TextInput value={search} onChangeText={setSearch} placeholder="Buscar alimento..." placeholderTextColor="#8B98A3" style={styles.search} />
			<FlatList horizontal data={filters} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} renderItem={({ item }) => (
				<TouchableOpacity style={[styles.filter, filter === item && styles.activeFilter]} onPress={() => setFilter(item)}>
					<Text style={[styles.filterText, filter === item && styles.activeFilterText]}>{item}</Text>
				</TouchableOpacity>
			)} />
			{error ? <Text style={styles.error}>{error}</Text> : null}
			{loading ? <ActivityIndicator color="#287653" style={styles.loader} /> : <FlatList data={visibleItems} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <FoodCard item={item} onFavoriteChange={handleFavoriteChange} />} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Nenhuma substituicao encontrada.</Text>} />}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F4F7F5' },
	header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
	eyebrow: { color: '#287653', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
	title: { marginTop: 7, color: '#142B3A', fontSize: 27, fontWeight: '800' },
	subtitle: { marginTop: 5, color: '#6B7A89', fontSize: 14 },
	search: { marginHorizontal: 20, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#DCE5E0', borderRadius: 10, backgroundColor: '#FFF', color: '#142B3A', fontSize: 15 },
	filters: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
	filter: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#DCE5E0', borderRadius: 20, backgroundColor: '#FFF' },
	activeFilter: { borderColor: '#287653', backgroundColor: '#287653' },
	filterText: { color: '#52616D', fontSize: 13, fontWeight: '600' },
	activeFilterText: { color: '#FFF' },
	error: { marginHorizontal: 20, marginBottom: 8, color: '#B34B4B', fontSize: 12 },
	loader: { marginTop: 35 },
	list: { paddingHorizontal: 20, paddingBottom: 24 },
	empty: { paddingTop: 35, color: '#6B7A89', textAlign: 'center' },
});
