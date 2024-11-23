import React from "react";
import { View, Text, Modal, Pressable, FlatList, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useStore } from "../store";

interface RecitorSelectorProps {
	isVisible: boolean;
	onClose: () => void;
	buttonPosition?: {
		bottom?: number;
		left?: number;
		right?: number;
		top?: number;
	};
	showButton?: boolean;
}

const RecitorSelector: React.FC<RecitorSelectorProps> = ({
	isVisible,
	onClose,
	buttonPosition = { left: 4, bottom: 4 },
	showButton = true,
}) => {
	const { recitations, selectedRecitor, setSelectedRecitor } = useStore();

	const getReciterImage = (id: number) => {
		switch (id) {
			case 1:
				return require("../assets/images/reciters/1.jpg");
			case 2:
				return require("../assets/images/reciters/2.jpeg");
			case 3:
				return require("../assets/images/reciters/3.jpeg");
			case 4:
				return require("../assets/images/reciters/4.jpg");
			case 5:
				return require("../assets/images/reciters/5.jpg");
			case 6:
				return require("../assets/images/reciters/6.jpg");
			case 7:
				return require("../assets/images/reciters/7.jpg");
			case 9:
				return require("../assets/images/reciters/9.jpg");
			case 10:
				return require("../assets/images/reciters/10.jpg");
			case 12:
				return require("../assets/images/reciters/12.jpg");
			default:
				return require("../assets/images/reciters/1.jpg");
		}
	};

	return (
		<View className="flex-1 bg-red-300">
			{showButton && (
				<Pressable
					className="h-14 w-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
					style={buttonPosition}
					onPress={() => onClose()}
				>
					<FontAwesome name="microphone" size={24} color="white" />
				</Pressable>
			)}

			<Modal
				animationType="slide"
				transparent={false}
				visible={isVisible}
				onRequestClose={onClose}
			>
				<View className="flex-1 justify-end bg-black">
					<View className="bg-gray-900 rounded-t-3xl shadow-xl">
						<View className="p-4 border-b border-gray-800 flex-row justify-between items-center">
							<View className="w-8" />
							<Text className="text-xl font-semibold text-white">
								Select Recitor
							</Text>
							<Pressable
								className="w-8 h-8 rounded-full items-center justify-center"
								onPress={onClose}
							>
								<FontAwesome
									name="close"
									size={20}
									color="white"
								/>
							</Pressable>
						</View>
						<FlatList
							data={recitations}
							className="max-h-72"
							showsVerticalScrollIndicator={false}
							renderItem={({ item }) => (
								<Pressable
									className={`p-4 border-b border-gray-800 flex-row items-center justify-between ${
										selectedRecitor?.id === item.id
											? "bg-gray-800"
											: ""
									}`}
									onPress={() => {
										setSelectedRecitor(item);
										onClose();
									}}
								>
									<View className="flex-row items-center">
										{/* <View className="w-12 h-12 rounded-full">
											<Image
												source={getReciterImage(
													item.id
												)}
												className="w-10 h-10 rounded-full"
											/>
										</View> */}
										<View className="flex-1">
											<Text className="text-base font-medium text-white">
												{item.reciter_name}
											</Text>
											<Text className="text-sm text-gray-400">
												{item.style}
											</Text>
										</View>
									</View>
									{selectedRecitor?.id === item.id && (
										<FontAwesome
											name="check"
											size={18}
											color="#60a5fa"
										/>
									)}
								</Pressable>
							)}
							keyExtractor={(item) => item.id.toString()}
						/>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default RecitorSelector;
