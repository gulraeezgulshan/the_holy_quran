import React, { useEffect } from "react";
import { View, Text, Modal, Pressable, FlatList, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import { fetchRecitations } from "../query/verses";

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
	const { recitations, selectedRecitor, setRecitations, setSelectedRecitor } =
		useStore();

	const {
		isLoading: isLoadingRecitations,
		error,
		data,
	} = useQuery({
		queryKey: ["recitations"],
		queryFn: async () => {
			const data = await fetchRecitations();
			setRecitations(data.recitations);
			return data.recitations;
		},
		enabled: true,
		staleTime: Infinity,
		retry: 2,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

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

	const renderContent = () => {
		if (isLoadingRecitations) {
			return (
				<View className="p-4">
					<Text className="text-gray-900">
						Loading recitations...
					</Text>
				</View>
			);
		}

		if (error) {
			return (
				<View className="p-4">
					<Text className="text-gray-900">
						Error loading recitations: {(error as Error).message}
					</Text>
				</View>
			);
		}

		if (!recitations?.length) {
			return (
				<View className="p-4">
					<Text className="text-gray-900">
						No recitations available
					</Text>
				</View>
			);
		}

		return (
			<FlatList
				data={recitations}
				className="max-h-72"
				showsVerticalScrollIndicator={false}
				renderItem={({ item }) => (
					<Pressable
						className={`p-4 border-b border-gray-200 flex-row items-center justify-between ${
							selectedRecitor?.id === item.id
								? "bg-gray-100"
								: "bg-white"
						}`}
						onPress={() => {
							setSelectedRecitor(item);
							onClose();
						}}
					>
						<View className="flex-row items-center space-x-3">
							{/* <View className="w-12 h-12 rounded-full overflow-hidden">
								<Image
									source={getReciterImage(item.id)}
									className="w-full h-full"
									resizeMode="cover"
								/>
							</View> */}

							<View>
								<Text className="text-base font-medium text-gray-900">
									{item.reciter_name}
								</Text>
								<Text className="text-sm text-gray-500">
									{item.style || "Default"}
								</Text>
							</View>
						</View>
						{selectedRecitor?.id === item.id && (
							<FontAwesome
								name="check"
								size={18}
								color="#3b82f6"
							/>
						)}
					</Pressable>
				)}
				keyExtractor={(item) => item.id.toString()}
			/>
		);
	};

	return (
		<View className="flex-1 p-4">
			{showButton && (
				<Pressable
					className="absolute h-14 w-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
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
				<Pressable className="flex-1 bg-black/20" onPress={onClose}>
					<View className="flex-1 justify-end">
						<Pressable onPress={(e) => e.stopPropagation()}>
							<View className="bg-white rounded-t-3xl shadow-xl max-h-[80%]">
								<View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
									<View className="w-8" />
									<Text className="text-xl font-semibold text-gray-900">
										Select Recitor
									</Text>
									<Pressable
										className="w-8 h-8 rounded-full items-center justify-center"
										onPress={onClose}
									>
										<FontAwesome
											name="close"
											size={20}
											color="#4b5563"
										/>
									</Pressable>
								</View>
								{renderContent()}
							</View>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
};

export default RecitorSelector;
