// Pantalla de Checkout - Resumen de Compra
import { Button } from "@/components/atoms/Button";
import { Hamburger3D } from "@/components/organisms/Hamburger3D";
import {
	HAMBURGER_INGREDIENTS,
	type HamburgerIngredient,
} from "@/lib/core/domain/hamburger.types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Check, ShoppingBag } from "lucide-react-native";

export default function HamburgerCheckoutScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ ingredients?: string; totalPrice?: string }>();

	const selectedIngredients: HamburgerIngredient[] = params.ingredients
		? JSON.parse(params.ingredients)
		: [];
	const totalPrice = params.totalPrice ? parseFloat(params.totalPrice) : 0;

	const handleConfirmPurchase = () => {
		// Aquí se podría enviar la orden a un servidor
		router.push({
			pathname: "./hamburger-success",
			params: {
				totalPrice: totalPrice.toString(),
				itemCount: (selectedIngredients.length + 2).toString(),
			},
		});
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<ShoppingBag size={40} color="#1a1a1a" strokeWidth={2} />
					<Text style={styles.title}>Resumen de tu Orden</Text>
				</View>

				{/* Vista previa 3D */}
				<View style={styles.modelContainer}>
					<Hamburger3D selectedIngredients={selectedIngredients} layout="single" />
				</View>

				{/* Detalles de la hamburguesa */}
				<View style={styles.detailsCard}>
					<View style={styles.detailsHeader}>
						<Text style={styles.detailsTitle}>Tu Hamburguesa:</Text>
					</View>

					<View style={styles.itemsList}>
						{/* Pan Superior */}
						<ItemRow
							label="Pan Superior"
							price={0}
							color="#D4A574"
							isBase={true}
						/>

						{/* Ingredientes seleccionados */}
						{selectedIngredients.map((ingredient, index) => {
							const config = HAMBURGER_INGREDIENTS[ingredient];
							const colorMap: Record<HamburgerIngredient, string> = {
								queso: "#FFD700",
								pepinillos: "#90EE90",
								lechuga: "#7CFC00",
								carne: "#8B4513",
							};
							return (
								<ItemRow
									key={`${ingredient}-${index}`}
									label={config.label}
									price={config.price}
									color={colorMap[ingredient]}
								/>
							);
						})}

						{/* Pan Inferior */}
						<ItemRow
							label="Pan Inferior"
							price={0}
							color="#D4A574"
							isBase={true}
						/>
					</View>

					{/* Divider */}
					<View style={styles.divider} />

					{/* Resumen de precios */}
					<View style={styles.priceBreakdown}>
						<PriceRow label="Hamburguesa Base" amount={1} />
						{selectedIngredients.length > 0 && (
							<PriceRow
								label={`Ingredientes (${selectedIngredients.length})`}
								amount={selectedIngredients.reduce((sum, ing) => {
									return sum + HAMBURGER_INGREDIENTS[ing].price;
								}, 0)}
							/>
						)}
						<View style={styles.totalRow}>
							<Text style={styles.totalLabel}>Total a Pagar:</Text>
							<Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
						</View>
					</View>
				</View>

				{/* Información de entrega */}
				<View style={styles.infoCard}>
					<Text style={styles.infoTitle}>Información de Entrega</Text>
					<Text style={styles.infoText}>Tu hamburguesa será preparada al momento</Text>
					<Text style={styles.infoText}>Tiempo estimado: 5-10 minutos</Text>
				</View>

				{/* Botones de acción */}
				<View style={styles.actionButtons}>
					<Button onPress={handleConfirmPurchase} variant="primary">
						Confirmar Compra
					</Button>
					<Button onPress={() => router.back()} variant="secondary">
						← Volver a Editar
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}

function ItemRow({
	label,
	price,
	color,
	isBase = false,
}: {
	label: string;
	price: number;
	color: string;
	isBase?: boolean;
}) {
	return (
		<View style={styles.itemRow}>
			<View style={styles.itemContent}>
				<View style={[styles.itemColorDot, { backgroundColor: color }]} />
				<View style={styles.itemLabels}>
					<Text style={styles.itemLabel}>{label}</Text>
					{isBase && <Text style={styles.itemNote}>(Incluido)</Text>}
				</View>
			</View>
			<Text style={styles.itemPrice}>{price > 0 ? `+$${price.toFixed(2)}` : "Incluido"}</Text>
		</View>
	);
}

function PriceRow({ label, amount }: { label: string; amount: number }) {
	return (
		<View style={styles.priceRow}>
			<Text style={styles.priceRowLabel}>{label}</Text>
			<Text style={styles.priceRowAmount}>${amount.toFixed(2)}</Text>
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
		gap: 12,
		paddingTop: 12,
		width: "100%",
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		color: "#1a1a1a",
	},
	modelContainer: {
		width: "100%",
		height: 280,
		backgroundColor: "#f8f8f8",
		borderRadius: 20,
		overflow: "hidden",
		borderWidth: 2,
		borderColor: "#e5e5e5",
	},
	detailsCard: {
		width: "100%",
		backgroundColor: "#f8f8f8",
		borderRadius: 16,
		padding: 16,
		gap: 12,
		borderWidth: 1,
		borderColor: "#e5e5e5",
	},
	detailsHeader: {
		marginBottom: 4,
	},
	detailsTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1a1a1a",
	},
	itemsList: {
		gap: 8,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e5e5e5",
	},
	itemContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	itemColorDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	itemLabels: {
		gap: 2,
		flex: 1,
	},
	itemLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1a1a1a",
	},
	itemNote: {
		fontSize: 11,
		color: "#9ca3af",
		fontStyle: "italic",
	},
	itemPrice: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1a1a1a",
		marginLeft: 8,
	},
	divider: {
		height: 1,
		backgroundColor: "#e5e5e5",
		marginVertical: 4,
	},
	priceBreakdown: {
		gap: 8,
		paddingTop: 4,
	},
	priceRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 4,
	},
	priceRowLabel: {
		fontSize: 14,
		color: "#6b7280",
		fontWeight: "500",
	},
	priceRowAmount: {
		fontSize: 14,
		color: "#6b7280",
		fontWeight: "600",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 8,
		paddingHorizontal: 4,
		borderTopWidth: 1,
		borderTopColor: "#e5e5e5",
		marginTop: 4,
	},
	totalLabel: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1a1a1a",
	},
	totalAmount: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1a1a1a",
	},
	infoCard: {
		width: "100%",
		backgroundColor: "#ecfdf5",
		borderRadius: 12,
		padding: 14,
		gap: 8,
		borderWidth: 1,
		borderColor: "#a7f3d0",
	},
	infoTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: "#065f46",
	},
	infoText: {
		fontSize: 13,
		color: "#047857",
	},
	actionButtons: {
		width: "100%",
		gap: 12,
		alignItems: "center",
		paddingTop: 8,
		paddingBottom: 20,
	},
});
