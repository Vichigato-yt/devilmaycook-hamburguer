import { Pressable, StyleSheet, Text, type ReactNode } from "react-native";

type ButtonProps = {
	onPress: () => void;
	children: string | ReactNode;
	variant?: "primary" | "secondary";
	disabled?: boolean;
};

export function Button({ onPress, children, variant = "primary", disabled = false }: ButtonProps) {
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.button,
				variant === "primary" ? styles.primary : styles.secondary,
				pressed && styles.pressed,
				disabled && styles.disabled,
			]}
		>
			{typeof children === "string" ? (
				<Text style={[styles.text, variant === "secondary" && styles.textSecondary]}>{children}</Text>
			) : (
				children
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 14,
		paddingHorizontal: 28,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		minWidth: 160,
	},
	primary: {
		backgroundColor: "#1a1a1a",
	},
	secondary: {
		backgroundColor: "transparent",
		borderWidth: 2,
		borderColor: "#1a1a1a",
	},
	pressed: {
		opacity: 0.7,
		transform: [{ scale: 0.98 }],
	},
	disabled: {
		opacity: 0.4,
	},
	text: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	textSecondary: {
		color: "#1a1a1a",
	},
});
