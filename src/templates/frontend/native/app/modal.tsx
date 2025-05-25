import { Container } from "@/components/container";
import { Text, View } from "react-native";

export default function Modal() {
	return (
		<Container>
			<View className="flex-1 justify-center items-center">
				<Text className="text-xl font-bold text-foreground">Modal View</Text>
			</View>
		</Container>
	);
}
