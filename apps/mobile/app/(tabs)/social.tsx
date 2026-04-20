import { View, Text } from "react-native";

export default function SocialScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">Friends</Text>
      <Text className="mt-2 text-gray-500">See what your friends are planting</Text>
    </View>
  );
}
