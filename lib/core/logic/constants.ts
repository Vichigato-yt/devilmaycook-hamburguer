// Configuración (Thresholds)

// Umbral de agitación en múltiplos de g (gravedad ≈ 1.0)
// 1.78–2.2 suele funcionar bien para evitar falsos positivos
export const SHAKE_THRESHOLD = 1.78;

// Intervalo de lectura del acelerómetro (ms)
export const ACCEL_UPDATE_INTERVAL_MS = 100;

// Tiempo mínimo entre detecciones consecutivas de "shake" (ms)
export const SHAKE_COOLDOWN_MS = 600;
