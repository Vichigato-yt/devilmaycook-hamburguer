// Pantalla de Visualización de Hamburguesa
import { Button } from "@/components/atoms/Button";
import { Hamburger3D } from "@/components/organisms/Hamburger3D";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Layers } from "lucide-react-native";

export default function HamburgerScreen() {
	const router = useRouter();
	const [layout, setLayout] = useState<"single" | "separate">("separate");

	const modelContainerStyle = useMemo(
		() => [styles.modelContainerBase, layout === "single" ? styles.modelContainerSingle : null],
		[layout]
	);

	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<View style={styles.container}>
				<View style={styles.header}>
					<View style={styles.titleRow}>
						<Layers size={32} color="#1a1a1a" strokeWidth={2.5} />
						<Text style={styles.title}>Hamburguesa en Capas</Text>
					</View>
					<Text style={styles.subtitle}>
						Visualiza todos los componentes de la hamburguesa
					</Text>
				</View>

				<Button
					onPress={() => setLayout((prev) => (prev === "single" ? "separate" : "single"))}
					variant="secondary"
				>
					{layout === "single" ? "Ver por capas" : "Ver en una sola escena"}
				</Button>

				{/* Contenedor del modelo 3D */}
				<View style={modelContainerStyle}>
					<Hamburger3D layout={layout} selectedIngredients={["queso", "pepinillos", "lechuga", "carne"]} />
				</View>

				{/* Leyenda de capas */}
				<View style={styles.legendContainer}>
					<Text style={styles.legendTitle}>Componentes:</Text>
					<View style={styles.layersList}>
						<LayerItem name="Pan Superior" color="#D4A574" />
						<LayerItem name="Queso" color="#FFD700" />
						<LayerItem name="Pepinillos" color="#90EE90" />
						<LayerItem name="Lechuga" color="#7CFC00" />
						<LayerItem name="Carne" color="#8B4513" />
						<LayerItem name="Pan Inferior" color="#D4A574" />
					</View>
				</View>

				{/* Botón para ir al constructor */}
				<Button
					onPress={() => router.push("/games/hamburger-builder")}
					variant="primary"
				>
					Construir mi Hamburguesa
				</Button>

				<Button onPress={() => router.push("/")} variant="secondary">
					← Volver al Inicio
				</Button>
			</View>
		</ScrollView>
	);
}

function LayerItem({ name, color }: { name: string; color: string }) {
	return (
		<View style={styles.layerItem}>
			<View style={[styles.colorIndicator, { backgroundColor: color }]} />
			<Text style={styles.layerName}>{name}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: "#ffffff",
	},
	container: {
		flex: 1,
		padding: 20,
		gap: 20,
		alignItems: "center",
	},
	header: {
		alignItems: "center",
		gap: 8,
		paddingTop: 20,
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
	modelContainerBase: {
		width: "100%",
		backgroundColor: "#f8f8f8",
		borderRadius: 20,
		overflow: "hidden",
		borderWidth: 2,
		borderColor: "#e5e5e5",
	},
	modelContainerSingle: {
		height: 400,
	},
	legendContainer: {
		width: "100%",
		backgroundColor: "#f8f8f8",
		borderRadius: 12,
		padding: 16,
		gap: 12,
	},
	legendTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 8,
	},
	layersList: {
		gap: 8,
	},
	layerItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingVertical: 8,
	},
	colorIndicator: {
		width: 16,
		height: 16,
		borderRadius: 8,
	},
	layerName: {
		fontSize: 14,
		fontWeight: "500",
		color: "#1a1a1a",
	},
});
