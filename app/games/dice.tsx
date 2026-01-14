// Pantalla del Juego
import { Button } from "@/components/atoms/Button";
import { DiceCard } from "@/components/molecules/DiceCard";
import { SensorInfo } from "@/components/molecules/SensorInfo";
import { useAccelerometer } from "@/lib/modules/sensors/accelerometer";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Smartphone } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function roll(): number {
	return Math.floor(Math.random() * 6) + 1;
}

export default function DiceScreen() {
	const router = useRouter();
	const [value, setValue] = useState<number>(1);
	const [isRolling, setIsRolling] = useState(false);

	const handleRoll = () => {
		setIsRolling(true);
		const r = roll();
		setValue(r);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
		setTimeout(() => setIsRolling(false), 400);
	};

	const { isShake, data } = useAccelerometer({
		onShake: handleRoll,
	});

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.content}>
				<DiceCard value={value} isRolling={isRolling} onRoll={handleRoll} />

				<View style={styles.instructionBox}>
					<Smartphone size={32} color="#92400e" strokeWidth={2} />
					<Text style={styles.instructionText}>
						Agita tu dispositivo para lanzar el dado automáticamente
					</Text>
				</View>

				<SensorInfo data={data} isShaking={isShake} />

				<Button onPress={() => router.push("/")} variant="secondary">
					← Volver al Inicio
				</Button>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#ffffff",
	},
	content: {
		flex: 1,
		padding: 24,
		gap: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	instructionBox: {
		backgroundColor: "#fef3c7",
		borderRadius: 12,
		padding: 16,
		gap: 8,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#fbbf24",
		maxWidth: 320,
	},
	instructionText: {
		fontSize: 14,
		color: "#92400e",
		textAlign: "center",
		fontWeight: "500",
	},
});
