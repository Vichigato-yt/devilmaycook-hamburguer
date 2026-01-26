// Dominio - Tipos y lógica de la hamburguesa

export type HamburgerIngredient = "queso" | "pepinillos" | "lechuga" | "carne";

export const HAMBURGER_INGREDIENTS: Record<
	HamburgerIngredient,
	{
		label: string;
		modelId: string;
		price: number;
	}
> = {
	queso: { label: "Queso", modelId: "queso", price: 0.5 },
	pepinillos: { label: "Pepinillos", modelId: "pepinillos", price: 0.25 },
	lechuga: { label: "Lechuga", modelId: "leshuga", price: 0.25 },
	carne: { label: "Carne", modelId: "carne", price: 0.75 },
};

export const BASE_HAMBURGER_PRICE = 1.0; // Precio base sin ingredientes

export type HamburgerOrder = {
	ingredients: HamburgerIngredient[];
	totalPrice: number;
	timestamp: number;
};

/**
 * Calcula el precio total de la hamburguesa basado en los ingredientes seleccionados
 */
export function calculateHamburgerPrice(ingredients: HamburgerIngredient[]): number {
	const ingredientsCost = ingredients.reduce((sum, ingredient) => {
		return sum + HAMBURGER_INGREDIENTS[ingredient].price;
	}, 0);

	return BASE_HAMBURGER_PRICE + ingredientsCost;
}

/**
 * Obtiene el nombre formateado de un ingrediente
 */
export function getIngredientLabel(ingredient: HamburgerIngredient): string {
	return HAMBURGER_INGREDIENTS[ingredient].label;
}

/**
 * Obtiene el precio de un ingrediente
 */
export function getIngredientPrice(ingredient: HamburgerIngredient): number {
	return HAMBURGER_INGREDIENTS[ingredient].price;
}
