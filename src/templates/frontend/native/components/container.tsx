import { SafeAreaView } from "react-native";

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView className="flex flex-1 p-4 bg-background">
      {children}
    </SafeAreaView>
  );
};
