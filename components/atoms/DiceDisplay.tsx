import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

type DiceDisplayProps = {
	value: number;
	isRolling: boolean;
};

export function DiceDisplay({ value, isRolling }: DiceDisplayProps) {
	const animatedStyle = useAnimatedStyle(() => {
		if (isRolling) {
			return {
				transform: [
					{ rotate: withSequence(withTiming("360deg", { duration: 200 }), withTiming("0deg", { duration: 0 })) },
					{ scale: withSequence(withSpring(1.2), withSpring(1)) },
				],
			};
		}
		return {
			transform: [{ rotate: "0deg" }, { scale: 1 }],
		};
	});

	return (
		<Animated.View style={[styles.container, animatedStyle]}>
			<View style={styles.dice}>
				<Text style={styles.value}>{value}</Text>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
	},
	dice: {
		width: 140,
		height: 140,
		backgroundColor: "#fff",
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 8,
		borderWidth: 3,
		borderColor: "#1a1a1a",
	},
	value: {
		fontSize: 72,
		fontWeight: "900",
		color: "#1a1a1a",
	},
});
