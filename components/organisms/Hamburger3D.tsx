import { Center, Stage, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useEffect, useMemo } from "react";
import { PixelRatio, StyleSheet, View } from "react-native";
import type { Mesh, Object3D } from "three";
import type { GLTF } from "three-stdlib";
import { SkeletonUtils } from "three-stdlib";

export type Hamburger3DLayout = "single" | "separate";

export type HamburgerIngredientType = "queso" | "pepinillos" | "lechuga" | "carne";

type Hamburger3DProps = {
	layout?: Hamburger3DLayout;
	selectedIngredients?: HamburgerIngredientType[];
	showOnlyTopBun?: boolean;
};

type LayerConfig = {
	id: string;
	label: string;
	modelPath: any;
	scale?: number;
};

function normalizeSceneForBetterShading(root: Object3D) {
	root.traverse((obj) => {
		const maybeMesh = obj as Mesh;
		if (!maybeMesh.isMesh) return;

		maybeMesh.castShadow = true;
		maybeMesh.receiveShadow = true;

		// Si el modelo viene con normales planas / raras, recalcular puede suavizar.
		try {
			maybeMesh.geometry?.computeVertexNormals?.();
		} catch {
			// No-op
		}

		const material: any = maybeMesh.material;
		if (material) {
			material.flatShading = false;
			material.needsUpdate = true;
		}
	});
}

function Model({ modelPath, scale = 1.2 }: LayerConfig) {
	const glb = useGLTF(modelPath);
	const scene = (glb as GLTF).scene;
	const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

	useEffect(() => {
		normalizeSceneForBetterShading(cloned);
	}, [cloned]);

	return (
		<Center>
			<primitive object={cloned} scale={scale} />
		</Center>
	);
}

function LoadingFallback() {
	return (
		<mesh castShadow receiveShadow>
			<boxGeometry args={[1, 0.2, 1]} />
			<meshStandardMaterial color="#d1d5db" roughness={0.8} metalness={0.0} />
		</mesh>
	);
}

export function Hamburger3D({ 
	layout = "single", 
	selectedIngredients = ["queso", "pepinillos", "lechuga", "carne"],
	showOnlyTopBun = false,
}: Hamburger3DProps) {
	const dpr = Math.min(2, Math.max(1, PixelRatio.get()));

	// Construir las capas dinámicamente
	const allLayers: LayerConfig[] = [
		{
			id: "pansuperior",
			label: "Pan Superior",
			modelPath: require("@/assets/images/Hamburguesa/pansuperior.glb"),
			scale: 0.9,
		},
		{
			id: "queso",
			label: "Queso",
			modelPath: require("@/assets/images/Hamburguesa/queso.glb"),
			scale: 0.88,
		},
		{
			id: "pepinillos",
			label: "Pepinillos",
			modelPath: require("@/assets/images/Hamburguesa/pepinillos.glb"),
			scale: 0.88,
		},
		{
			id: "leshuga",
			label: "Lechuga",
			modelPath: require("@/assets/images/Hamburguesa/leshuga.glb"),
			scale: 0.88,
		},
		{
			id: "carne",
			label: "Carne",
			modelPath: require("@/assets/images/Hamburguesa/carne.glb"),
			scale: 0.88,
		},
		{
			id: "paninferior",
			label: "Pan Inferior",
			modelPath: require("@/assets/images/Hamburguesa/paninferior.glb"),
			scale: 0.9,
		},
	];

	// Filtrar capas según ingredientes seleccionados
	const layers = useMemo(() => {
		if (showOnlyTopBun) {
			return [allLayers[0]]; // Solo pan superior
		}

		const visibleLayers: LayerConfig[] = [allLayers[0]]; // Pan superior siempre visible
		
		if (selectedIngredients.includes("queso")) visibleLayers.push(allLayers[1]);
		if (selectedIngredients.includes("pepinillos")) visibleLayers.push(allLayers[2]);
		if (selectedIngredients.includes("lechuga")) visibleLayers.push(allLayers[3]);
		if (selectedIngredients.includes("carne")) visibleLayers.push(allLayers[4]);
		
		visibleLayers.push(allLayers[5]); // Pan inferior siempre visible

		return visibleLayers;
	}, [selectedIngredients, showOnlyTopBun]);

	return <Hamburger3DInternal dpr={dpr} layers={layers} layout={layout} />;
}

function Hamburger3DInternal({
	dpr,
	layers,
	layout = "single",
}: {
	dpr: number;
	layers: LayerConfig[];
	layout?: Hamburger3DLayout;
}) {
	if (layout === "separate") {
		return (
			<View style={styles.container}>
				<View style={styles.gallery}>
					{layers.map((layer) => (
						<View key={layer.id} style={styles.card}>
							<View style={styles.canvasWrap}>
								<Canvas
									dpr={[1, dpr]}
									frameloop="demand"
									shadows
									gl={{ antialias: true, powerPreference: "high-performance" }}
									camera={{ position: [0.9, 0.55, 4.2], fov: 38, near: 0.1, far: 60 }}
									style={styles.canvas}
								>
									<color attach="background" args={["#f8f8f8"]} />
									<Suspense fallback={<LoadingFallback />}>
										<Stage
											preset="rembrandt"
											intensity={1.15}
											environment="city"
											shadows={{ type: "contact", opacity: 0.4, blur: 2.5 }}
											adjustCamera
										>
											<group position={[0, -0.15, 0]}>
												<Model {...layer} />
											</group>
										</Stage>
									</Suspense>
								</Canvas>
							</View>
						</View>
					))}
				</View>
			</View>
		);
	}

	// Una sola escena con todas las capas, separadas en Y (exploded view)
	const explodedY = [1.15, 0.7, 0.25, -0.2, -0.65, -1.05];
	return (
		<View style={styles.container}>
			<Canvas
				dpr={[1, dpr]}
									frameloop="demand"
									shadows
				gl={{ antialias: true, powerPreference: "high-performance" }}
				camera={{ position: [0, 2.0, 5.5], fov: 35, near: 0.1, far: 60 }}
				style={styles.canvas}
			>
				<color attach="background" args={["#f8f8f8"]} />
				<ambientLight intensity={0.75} />
				<directionalLight
					position={[6, 8, 6]}
					intensity={2.2}
					castShadow
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
				/>
				<directionalLight position={[-6, 4, -4]} intensity={1.1} />
				<pointLight position={[0, 3, 3]} intensity={0.55} />

				<Suspense fallback={<LoadingFallback />}>
					{layers.map((layer, index) => (
						<group key={layer.id} position={[0, explodedY[index] ?? 0, 0]}>
							<Model {...layer} />
						</group>
					))}
				</Suspense>
			</Canvas>
		</View>
	);
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
	card: {
		width: "100%",
		borderRadius: 16,
		overflow: "hidden",
		borderWidth: 2,
		borderColor: "#e5e5e5",
		backgroundColor: "#f8f8f8",
	},
	canvasWrap: {
		width: "100%",
		height: 220,
		backgroundColor: "#f8f8f8",
	},
	canvas: {
		width: "100%",
		flex: 1,
	},
});
