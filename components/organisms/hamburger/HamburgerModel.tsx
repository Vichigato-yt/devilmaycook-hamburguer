import { useGLTF } from "@react-three/drei";
import React, { useEffect, useMemo } from "react";
import type { Material, Mesh, Object3D } from "three";
import { Box3, Vector3 } from "three";
import type { GLTF } from "three-stdlib";
import { SkeletonUtils } from "three-stdlib";

/**
 * Tipo del asset GLB.
 * - React Native/Expo: `require("./file.glb")` suele devolver un id numérico.
 * - Web: puede ser una URL (string).
 */
export type GlbAsset = number | string;

export type HamburgerLayerConfig = {
	id: string;
	label: string;
	modelAsset: GlbAsset;
	scale?: number;
};

/**
 * Normaliza geometría/materiales para que el shading se vea consistente.
 * - Activa sombras en meshes
 * - Recalcula normales (si es posible)
 * - Desactiva flatShading cuando exista en el material
 */
function normalizeSceneForBetterShading(root: Object3D) {
	root.traverse((obj) => {
		const maybeMesh = obj as Mesh;
		if (!maybeMesh.isMesh) return;

		maybeMesh.castShadow = true;
		maybeMesh.receiveShadow = true;

		try {
			maybeMesh.geometry?.computeVertexNormals?.();
		} catch {
			// No-op
		}

		const material = maybeMesh.material as Material | Material[];
		const materialArray = Array.isArray(material) ? material : [material];
		for (const mat of materialArray) {
			// `flatShading` existe en algunos materiales (p.ej. MeshStandardMaterial),
			// pero no está en el tipo base `Material`.
			if (mat && typeof mat === "object" && "flatShading" in mat) {
				(mat as Material & { flatShading: boolean }).flatShading = false;
			}
			mat.needsUpdate = true;
		}
	});
}

/**
 * Re-centra el modelo en X/Z sin tocar Y.
 * Útil para GLBs con pivot corrido (p.ej. pepinillos).
 */
function recenterSceneXZ(root: Object3D) {
	// Muchos GLB vienen con pivot corrido (p.ej. pepinillos).
	// Esto centra el contenido en el eje X/Z sin tocar Y.
	const box = new Box3().setFromObject(root);
	if (!Number.isFinite(box.min.x) || !Number.isFinite(box.max.x)) return;
	const center = new Vector3();
	box.getCenter(center);
	root.position.x -= center.x;
	root.position.z -= center.z;
}

/**
 * Renderiza un modelo GLB como `primitive`.
 * Clona la escena para evitar conflictos cuando el mismo GLB se usa en varios canvases.
 */
export function HamburgerModel({ modelAsset, scale = 1.0 }: Pick<HamburgerLayerConfig, "modelAsset" | "scale">) {
	// `useGLTF` está tipado principalmente para paths (string), pero en RN/Expo usamos asset ids.
	// Hacemos el cast a su tipo esperado para mantener tipado estricto.
	const glb = useGLTF(modelAsset as unknown as Parameters<typeof useGLTF>[0]);
	const scene = (glb as GLTF).scene;

	// Clon por instancia para que cada canvas tenga su propio árbol de Object3D.
	const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

	useEffect(() => {
		// Ajustes visuales post-clonado.
		normalizeSceneForBetterShading(cloned);
		recenterSceneXZ(cloned);
	}, [cloned]);

	return <primitive object={cloned} scale={scale} />;
}
