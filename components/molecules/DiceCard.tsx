import { Dice6 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../atoms/Button";
import { DiceDisplay } from "../atoms/DiceDisplay";

type DiceCardProps = {
	value: number;
	isRolling: boolean;
	onRoll: () => void;
};

export function DiceCard({ value, isRolling, onRoll }: DiceCardProps) {
	return (
		<View style={styles.card}>
			<View style={styles.titleContainer}>
				<Dice6 size={28} color="#1a1a1a" strokeWidth={2.5} />
				<Text style={styles.title}>Magic Dice</Text>
			</View>
			<View style={styles.diceContainer}>
				<DiceDisplay value={value} isRolling={isRolling} />
			</View>
			<Button onPress={onRoll} variant="primary">
				Lanzar Dado
			</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#f8f8f8",
		borderRadius: 20,
		padding: 32,
		gap: 24,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 4,
		minWidth: 300,
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		color: "#1a1a1a",
	},
	diceContainer: {
		marginVertical: 16,
	},
});
