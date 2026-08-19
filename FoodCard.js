import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { isFavorite, toggleFavorite } from '../services/favorites';

const impactColors = {
	verde: '#2E9B62',
	amarelo: '#D99A22',
	vermelho: '#D45151',
};

export default function FoodCard({ item, onFavoriteChange }) {
	const [favorite, setFavorite] = useState(false);
	const impact = String(item.impact_level || item.impact || 'verde').toLowerCase();
	const color = impactColors[impact] || impactColors.verde;

	useEffect(() => {
		let active = true;
		isFavorite(item).then((value) => active && setFavorite(value));
		return () => { active = false; };
	}, [item]);

	async function handleFavorite() {
		const result = await toggleFavorite(item);
		setFavorite(result.isFavorite);
		onFavoriteChange?.(result.favorites);
	}

	return (
		<View style={styles.card}>
			<View style={[styles.impactIndicator, { backgroundColor: color }]} />
			<View style={styles.content}>
				<Text style={styles.label}>SUBSTITUICAO</Text>
				<Text style={styles.original}>{item.original_food || item.original || 'Alimento original'}</Text>
				<Text style={styles.arrow}>↓</Text>
				<Text style={styles.substitute}>{item.substitute || item.replacement || 'Substituto'}</Text>
				<Text style={styles.category}>{item.category || 'Sem categoria'}</Text>
			</View>
			<TouchableOpacity accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} style={styles.favoriteButton} onPress={handleFavorite}>
				<Text style={[styles.favoriteIcon, favorite && styles.favoriteActive]}>{favorite ? '♥' : '♡'}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	card: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#172A3A', shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
	impactIndicator: { width: 6 },
	content: { flex: 1, padding: 16 },
	label: { color: '#6B7A89', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
	original: { marginTop: 5, color: '#304050', fontSize: 14 },
	arrow: { marginVertical: 2, color: '#9AA7B2', fontSize: 16 },
	substitute: { color: '#142B3A', fontSize: 18, fontWeight: '700' },
	category: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, backgroundColor: '#EAF4F0', color: '#287653', fontSize: 12, fontWeight: '600' },
	favoriteButton: { justifyContent: 'center', alignItems: 'center', width: 58 },
	favoriteIcon: { color: '#9AA7B2', fontSize: 30 },
	favoriteActive: { color: '#D45151' },
});
