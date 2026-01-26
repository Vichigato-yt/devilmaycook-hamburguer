// Pantalla Interactiva - Constructor de Hamburguesa
import { Button } from "@/components/atoms/Button";
import { Hamburger3D } from "@/components/organisms/Hamburger3D";
import {
	HAMBURGER_INGREDIENTS,
	HamburgerIngredient,
	calculateHamburgerPrice,
	BASE_HAMBURGER_PRICE,
	type HamburgerOrder,
} from "@/lib/core/domain/hamburger.types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { ShoppingCart, Plus, X } from "lucide-react-native";

const INGREDIENTS_LIST: HamburgerIngredient[] = ["queso", "pepinillos", "lechuga", "carne"];

export default function HamburgerBuilderScreen() {
	const router = useRouter();
	const [selectedIngredients, setSelectedIngredients] = useState<HamburgerIngredient[]>([]);
	const totalPrice = calculateHamburgerPrice(selectedIngredients);

	const toggleIngredient = (ingredient: HamburgerIngredient) => {
		setSelectedIngredients((prev) => {
			if (prev.includes(ingredient)) {
				return prev.filter((i) => i !== ingredient);
			} else {
				return [...prev, ingredient];
			}
		});
	};

	const handleBuy = () => {
		const order: HamburgerOrder = {
			ingredients: selectedIngredients,
			totalPrice,
			timestamp: Date.now(),
		};
		router.push({
			pathname: "./hamburger-checkout",
			params: {
				ingredients: JSON.stringify(selectedIngredients),
				totalPrice: totalPrice.toString(),
			},
		});
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.titleRow}>
						<ShoppingCart size={32} color="#1a1a1a" strokeWidth={2.5} />
						<Text style={styles.title}>Construir Hamburguesa</Text>
					</View>
					<Text style={styles.subtitle}>Añade ingredientes y personaliza tu hamburguesa</Text>
				</View>

				{/* Hamburguesa 3D */}
				<View style={styles.modelContainer}>
					<Hamburger3D selectedIngredients={selectedIngredients} layout="single" />
				</View>

				{/* Precio actual */}
				<View style={styles.priceCard}>
					<Text style={styles.priceLabel}>Precio Total:</Text>
					<Text style={styles.priceValue}>${totalPrice.toFixed(2)}</Text>
				</View>

				{/* Botones de ingredientes */}
				<View style={styles.ingredientsSection}>
					<Text style={styles.sectionTitle}>Ingredientes</Text>
					<View style={styles.ingredientsGrid}>
						{INGREDIENTS_LIST.map((ingredient) => {
							const config = HAMBURGER_INGREDIENTS[ingredient];
							const isSelected = selectedIngredients.includes(ingredient);

							return (
								<Pressable
									key={ingredient}
									onPress={() => toggleIngredient(ingredient)}
									style={[
										styles.ingredientButton,
										isSelected && styles.ingredientButtonSelected,
									]}
								>
									<View style={styles.ingredientButtonContent}>
										<Text
											style={[
												styles.ingredientButtonText,
												isSelected && styles.ingredientButtonTextSelected,
											]}
										>
											{config.label}
										</Text>
										<Text
											style={[
												styles.ingredientPrice,
												isSelected && styles.ingredientPriceSelected,
											]}
										>
											+${config.price.toFixed(2)}
										</Text>
									</View>
									<View style={styles.ingredientIcon}>
										{isSelected ? (
											<X size={20} color="#fff" strokeWidth={2.5} />
										) : (
											<Plus size={20} color="#1a1a1a" strokeWidth={2.5} />
										)}
									</View>
								</Pressable>
							);
						})}
					</View>
				</View>

				{/* Ingredientes seleccionados */}
				{selectedIngredients.length > 0 && (
					<View style={styles.selectedIngredientsSection}>
						<Text style={styles.sectionTitle}>Tu Hamburguesa:</Text>
						<View style={styles.selectedList}>
							<IngredientTag label="Pan Superior" color="#D4A574" />
							{selectedIngredients.map((ingredient) => {
								const config = HAMBURGER_INGREDIENTS[ingredient];
								const colorMap: Record<HamburgerIngredient, string> = {
									queso: "#FFD700",
									pepinillos: "#90EE90",
									lechuga: "#7CFC00",
									carne: "#8B4513",
								};
								return (
									<IngredientTag
										key={ingredient}
										label={config.label}
										color={colorMap[ingredient]}
									/>
								);
							})}
							<IngredientTag label="Pan Inferior" color="#D4A574" />
						</View>
					</View>
				)}

				{/* Botones de acción */}
				<View style={styles.actionButtons}>
					<Button onPress={handleBuy} variant="primary">
						Comprar - ${totalPrice.toFixed(2)}
					</Button>
					<Button onPress={() => router.push("/")} variant="secondary">
						← Volver
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}

function IngredientTag({ label, color }: { label: string; color: string }) {
	return (
		<View style={[styles.ingredientTag, { backgroundColor: color }]}>
			<Text style={styles.ingredientTagText}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: "#ffffff",
	},
	container: {
		padding: 20,
		gap: 16,
		alignItems: "center",
	},
	header: {
		alignItems: "center",
		gap: 8,
		paddingTop: 12,
		width: "100%",
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		color: "#1a1a1a",
	},
	subtitle: {
		fontSize: 14,
		color: "#6b7280",
		textAlign: "center",
	},
	modelContainer: {
		width: "100%",
		height: 300,
		backgroundColor: "#f8f8f8",
		borderRadius: 20,
		overflow: "hidden",
		borderWidth: 2,
		borderColor: "#e5e5e5",
	},
	priceCard: {
		width: "100%",
		backgroundColor: "#f0f0f0",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		gap: 8,
		borderWidth: 2,
		borderColor: "#1a1a1a",
	},
	priceLabel: {
		fontSize: 14,
		color: "#6b7280",
		fontWeight: "500",
	},
	priceValue: {
		fontSize: 32,
		fontWeight: "700",
		color: "#1a1a1a",
	},
	ingredientsSection: {
		width: "100%",
		gap: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1a1a1a",
	},
	ingredientsGrid: {
		gap: 12,
		width: "100%",
	},
	ingredientButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 14,
		backgroundColor: "#f8f8f8",
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#e5e5e5",
	},
	ingredientButtonSelected: {
		backgroundColor: "#1a1a1a",
		borderColor: "#1a1a1a",
	},
	ingredientButtonContent: {
		flex: 1,
		gap: 4,
	},
	ingredientButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1a1a1a",
	},
	ingredientButtonTextSelected: {
		color: "#fff",
	},
	ingredientPrice: {
		fontSize: 12,
		color: "#6b7280",
		fontWeight: "500",
	},
	ingredientPriceSelected: {
		color: "#d1d5db",
	},
	ingredientIcon: {
		marginLeft: 12,
		alignItems: "center",
		justifyContent: "center",
		width: 28,
		height: 28,
	},
	selectedIngredientsSection: {
		width: "100%",
		gap: 12,
	},
	selectedList: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	ingredientTag: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		marginBottom: 4,
	},
	ingredientTagText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#1a1a1a",
	},
	actionButtons: {
		width: "100%",
		gap: 12,
		alignItems: "center",
		paddingTop: 8,
		paddingBottom: 20,
	},
});
