import { type Vector3 } from "@/lib/core/logic/motion";
import { Flame, Moon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

type SensorInfoProps = {
	data: Vector3 | null;
	isShaking: boolean;
};

export function SensorInfo({ data, isShaking }: SensorInfoProps) {
	const indicatorStyle = useAnimatedStyle(() => ({
		backgroundColor: withSpring(isShaking ? "#22c55e" : "#6b7280", {
			damping: 10,
		}),
		transform: [{ scale: withSpring(isShaking ? 1.1 : 1) }],
	}));

	return (
		<View style={styles.container}>
			<View style={styles.statusRow}>
				<Animated.View style={[styles.indicator, indicatorStyle]} />
				{isShaking ? (
					<Flame size={18} color="#22c55e" strokeWidth={2} />
				) : (
					<Moon size={18} color="#6b7280" strokeWidth={2} />
				)}
				<Text style={styles.statusText}>
					{isShaking ? "Agitando" : "En reposo"}
				</Text>
			</View>

			{data && (
				<View style={styles.dataContainer}>
					<Text style={styles.dataTitle}>Acelerómetro (g)</Text>
					<View style={styles.dataRow}>
						<Text style={styles.dataLabel}>X:</Text>
						<Text style={styles.dataValue}>{data.x.toFixed(2)}</Text>
					</View>
					<View style={styles.dataRow}>
						<Text style={styles.dataLabel}>Y:</Text>
						<Text style={styles.dataValue}>{data.y.toFixed(2)}</Text>
					</View>
					<View style={styles.dataRow}>
						<Text style={styles.dataLabel}>Z:</Text>
						<Text style={styles.dataValue}>{data.z.toFixed(2)}</Text>
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		gap: 12,
		borderWidth: 1,
		borderColor: "#e5e5e5",
	},
	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	indicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	statusText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1a1a1a",
	},
	dataContainer: {
		gap: 6,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: "#e5e5e5",
	},
	dataTitle: {
		fontSize: 12,
		fontWeight: "600",
		color: "#6b7280",
		marginBottom: 4,
	},
	dataRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	dataLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: "#6b7280",
	},
	dataValue: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1a1a1a",
		fontFamily: "monospace",
	},
});
