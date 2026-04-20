import { View, Text } from "react-native";

export default function BankScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">Your Bank</Text>
      <Text className="mt-2 text-gray-500">Tokens earned from unused screen time</Text>
    </View>
  );
}
