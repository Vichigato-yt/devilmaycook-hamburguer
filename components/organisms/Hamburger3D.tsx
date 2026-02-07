import { HAMBURGER_INGREDIENTS, type HamburgerIngredient } from "@/lib/core/domain/hamburger.types";
import React, { useMemo } from "react";
import { PixelRatio, StyleSheet, View } from "react-native";
import { HamburgerLayerCanvas } from "./hamburger/HamburgerLayerCanvas";
import type { GlbAsset, HamburgerLayerConfig } from "./hamburger/HamburgerModel";
import { HamburgerSingleCanvas } from "./hamburger/HamburgerSingleCanvas";

export type Hamburger3DLayout = "single" | "separate";

type Hamburger3DProps = {
	layout?: Hamburger3DLayout;
	selectedIngredients?: HamburgerIngredient[];
};

/**
 * Mapa de assets GLB disponibles.
 * Nota: `leshuga` es el nombre del archivo en assets (typo histórico),
 * pero el dominio usa `lechuga`.
 */
const MODEL_ASSETS: Record<string, GlbAsset> = {
	pansuperior: require("@/assets/images/Hamburguesa/pansuperior.glb"),
	paninferior: require("@/assets/images/Hamburguesa/paninferior.glb"),
	queso: require("@/assets/images/Hamburguesa/queso.glb"),
	pepinillos: require("@/assets/images/Hamburguesa/pepinillos.glb"),
	leshuga: require("@/assets/images/Hamburguesa/leshuga.glb"),
	carne: require("@/assets/images/Hamburguesa/carne.glb"),
};

export function Hamburger3D({
	layout = "single",
	selectedIngredients = ["queso", "pepinillos", "lechuga", "carne"],
}: Hamburger3DProps) {
	// DPR limitado para balancear calidad y rendimiento en móviles.
	const dpr = Math.min(2, Math.max(1, PixelRatio.get()));

	// Construye las capas (pan superior + ingredientes + pan inferior) con ids únicos
	// para soportar ingredientes duplicados.
	const layers: HamburgerLayerConfig[] = useMemo(() => {
		const built: HamburgerLayerConfig[] = [
			{
				id: "pansuperior",
				label: "Pan Superior",
				modelAsset: MODEL_ASSETS.pansuperior,
				scale: 0.9,
			},
		];

		for (const [index, ingredient] of selectedIngredients.entries()) {
			const config = HAMBURGER_INGREDIENTS[ingredient];
			built.push({
				id: `${config.modelId}-${index}`,
				label: config.label,
				modelAsset: MODEL_ASSETS[config.modelId],
				scale: 0.88,
			});
		}

		built.push({
			id: "paninferior",
			label: "Pan Inferior",
			modelAsset: MODEL_ASSETS.paninferior,
			scale: 0.9,
		});

		return built;
	}, [selectedIngredients]);

	if (layout === "separate") {
		// Modo galería: un Canvas por capa, con cámara/iluminación automática vía Stage.
		return (
			<View style={styles.container}>
				<View style={styles.gallery}>
					{layers.map((layer) => (
						<HamburgerLayerCanvas key={layer.id} layer={layer} dpr={dpr} />
					))}
				</View>
			</View>
		);
	}

	// Modo single: todas las capas en un solo Canvas con cámara dinámica.
	return <HamburgerSingleCanvas layers={layers} dpr={dpr} />;
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: "100%",
		backgroundColor: "#f8f8f8",
	},
	gallery: {
		width: "100%",
		gap: 12,
	},
});
