import { Button } from "@/components/atoms/Button";
import { useRouter } from "expo-router";
import { Dice6, Smartphone, Target, Zap } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Dice6 size={80} color="#1a1a1a" strokeWidth={2.5} />
        <Text style={styles.title}>Magic Dice</Text>
        <Text style={styles.subtitle}>
          El dado mágico que responde a tus movimientos
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Smartphone size={32} color="#6b7280" strokeWidth={2} />
          <Text style={styles.featureText}>Agita para lanzar</Text>
        </View>
        <View style={styles.feature}>
          <Zap size={32} color="#6b7280" strokeWidth={2} />
          <Text style={styles.featureText}>Respuesta instantánea</Text>
        </View>
        <View style={styles.feature}>
          <Target size={32} color="#6b7280" strokeWidth={2} />
          <Text style={styles.featureText}>100% aleatorio</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button onPress={() => router.push("/games/dice")} variant="primary">
          Jugar al Dado
        </Button>
        <Button onPress={() => router.push("/games/hamburger")} variant="secondary">
          Ver Hamburguesa
        </Button>
        <Button onPress={() => router.push("/games/hamburger-builder")} variant="primary">
          🍔 Construir Hamburguesa
        </Button>
      </View>

      <Text style={styles.footer}>Usa el acelerómetro de tu dispositivo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 32,
  },
  hero: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 280,
  },
  features: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  feature: {
    alignItems: "center",
    gap: 6,
    width: 100,
  },
  featureText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  actions: {
    width: "100%",
    maxWidth: 300,
    gap: 12,
  },
  footer: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});
