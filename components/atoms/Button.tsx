import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
	onPress: () => void;
	children: ReactNode;
	variant?: "primary" | "secondary";
	disabled?: boolean;
};

function isOnlyTextNode(node: ReactNode): boolean {
	if (node === null || node === undefined || typeof node === "boolean") return true;
	if (typeof node === "string" || typeof node === "number") return true;
	if (Array.isArray(node)) return node.every(isOnlyTextNode);
	if (typeof node === "object") {
		// Detecta Fragment sin importar React explícitamente
		const maybeElement: any = node;
		if (maybeElement?.type === Symbol.for("react.fragment")) {
			return isOnlyTextNode(maybeElement?.props?.children);
		}
		return false;
	}
	return false;
}

export function Button({ onPress, children, variant = "primary", disabled = false }: ButtonProps) {
	const wrapInText = isOnlyTextNode(children);
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => {
				const baseStyles = [
					styles.button,
					variant === "primary" ? styles.primary : styles.secondary,
				];
				if (pressed) baseStyles.push(styles.pressed);
				if (disabled) baseStyles.push(styles.disabled);
				return baseStyles;
			}}
		>
			{wrapInText ? (
				<Text style={[styles.text, variant === "secondary" ? styles.textSecondary : undefined]}>
					{children}
				</Text>
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
