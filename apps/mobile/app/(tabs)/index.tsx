import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-brand-600">ScreenBank</Text>
      <Text className="mt-2 text-gray-500">Spend less. Earn more.</Text>
    </View>
  );
}
