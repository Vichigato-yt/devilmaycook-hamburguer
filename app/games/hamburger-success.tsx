// Pantalla de Éxito - Compra Confirmada
import { Button } from "@/components/atoms/Button";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { CheckCircle } from "lucide-react-native";

export default function HamburgerSuccessScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ totalPrice?: string; itemCount?: string }>();

	const totalPrice = params.totalPrice ? parseFloat(params.totalPrice) : 0;
	const itemCount = params.itemCount ? parseInt(params.itemCount) : 0;

	const scaleAnim = React.useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			tension: 40,
			friction: 7,
			useNativeDriver: true,
		}).start();
	}, [scaleAnim]);

	return (
		<View style={styles.container}>
			{/* Ícono animado */}
			<Animated.View
				style={[
					styles.iconContainer,
					{
						transform: [{ scale: scaleAnim }],
					},
				]}
			>
				<CheckCircle size={100} color="#10b981" strokeWidth={1.5} />
			</Animated.View>

			{/* Título */}
			<Text style={styles.title}>¡Compra Confirmada!</Text>
			<Text style={styles.subtitle}>Tu hamburguesa está siendo preparada</Text>

			{/* Detalles de la orden */}
			<View style={styles.detailsCard}>
				<DetailItem label="Items en tu orden" value={itemCount.toString()} />
				<View style={styles.divider} />
				<DetailItem label="Total pagado" value={`$${totalPrice.toFixed(2)}`} highlight />
			</View>

			{/* Botones de acción */}
			<View style={styles.actionButtons}>
				<Button onPress={() => router.push("./hamburger-builder")} variant="primary">
					Hacer otra Hamburguesa
				</Button>
				<Button onPress={() => router.push("/")} variant="secondary">
					← Ir al Inicio
				</Button>
			</View>
		</View>
	);
}

function DetailItem({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	return (
		<View style={styles.detailRow}>
			<Text style={styles.detailLabel}>{label}</Text>
			<Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>
				{value}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		gap: 24,
	},
	iconContainer: {
		marginBottom: 12,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		color: "#1a1a1a",
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#6b7280",
		textAlign: "center",
	},
	detailsCard: {
		width: "100%",
		backgroundColor: "#f8f8f8",
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: "#e5e5e5",
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
	},
	detailLabel: {
		fontSize: 14,
		color: "#6b7280",
		fontWeight: "500",
	},
	detailValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1a1a1a",
	},
	detailValueHighlight: {
		fontSize: 18,
		fontWeight: "700",
		color: "#10b981",
	},
	divider: {
		height: 1,
		backgroundColor: "#e5e5e5",
	},
	actionButtons: {
		width: "100%",
		gap: 12,
		alignItems: "center",
		paddingBottom: 20,
	},
});
