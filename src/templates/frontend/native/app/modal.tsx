import { Text, View } from "react-native";

// @ts-expect-error <dler-remove-comment>
import { Container } from "@/components/container";

export default function Modal() {
  return (
    <Container>
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl font-bold text-foreground">Modal View</Text>
      </View>
    </Container>
  );
}
