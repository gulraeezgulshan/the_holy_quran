import { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Dimensions,
	Pressable,
	ImageBackground,
	Image,
} from "react-native";
import React from "react";
import { allahNames } from "../../data/allah_name";

const AllahNamesScreen = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const currentName = allahNames[currentIndex];
	const screenHeight = Dimensions.get("window").height;

	const goToNext = () => {
		if (currentIndex < allahNames.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};

	const goToPrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	return (
		<View className="flex-1 bg-gray-900 justify-center">
			<View
				className="bg-gray-800 mx-4 rounded-3xl shadow-lg overflow-hidden"
				style={{ minHeight: screenHeight * 0.6 }}
			>
				{/* Progress Bar */}
				<View className="h-1 bg-gray-700">
					<View
						className="h-1 bg-emerald-500"
						style={{
							width: `${
								((currentIndex + 1) / allahNames.length) * 100
							}%`,
						}}
					/>
				</View>

				{/* Content */}
				<View className="p-8 items-center justify-between flex-1">
					{/* Counter */}
					<Text className="text-gray-400 font-medium">
						{currentIndex + 1} / {allahNames.length}
					</Text>

					{/* Main Content */}
					<View className="items-center flex-1 justify-center">
						<Pressable onPress={goToNext}>
							<View className="flex-1 items-center justify-center">
								<Text
									className="text-5xl mb-4 font-bold text-center text-gray-100"
									adjustsFontSizeToFit
									numberOfLines={2}
									style={{
										maxWidth: "100%",
										lineHeight: 72,
										textAlignVertical: "center",
										includeFontPadding: false,
										padding: 8,
									}}
								>
									{currentName.name}
								</Text>

								<Text
									className="text-3xl mb-4 font-bold text-center text-gray-200"
									adjustsFontSizeToFit
									numberOfLines={2}
									style={{
										maxWidth: "100%",
										lineHeight: 72,
										textAlignVertical: "center",
										includeFontPadding: false,
										padding: 8,
									}}
								>
									{currentName.meaningUrdu}
								</Text>

								<Text className="text-2xl font-semibold text-emerald-400 text-center">
									{currentName.transliteration}
								</Text>

								<Text className="text-xl text-gray-300 text-center mb-4">
									{currentName.meaning}
								</Text>

								<Text className="text-gray-400 text-center leading-6 text-xl">
									{currentName.descriptionUrdu}
								</Text>
							</View>
						</Pressable>
					</View>

					{/* Navigation Buttons */}
					<View className="flex-row justify-between w-full mt-8">
						<TouchableOpacity
							onPress={goToPrevious}
							disabled={currentIndex === 0}
							className={`px-6 py-3 rounded-full border border-emerald-500 
								${currentIndex === 0 ? "opacity-40" : ""}`}
						>
							<Text className="text-emerald-400 font-medium">
								Previous
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={goToNext}
							disabled={currentIndex === allahNames.length - 1}
							className={`px-6 py-3 rounded-full bg-emerald-600 
								${currentIndex === allahNames.length - 1 ? "opacity-40" : ""}`}
						>
							<Text className="text-gray-100 font-medium">
								Next
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
			<Image
				source={require("../../assets/images/footer_2.png")}
				className="absolute w-full bottom-0"
				style={{
					height: Math.max(screenHeight * 0.1, 50),
					resizeMode: "cover",
				}}
			/>
		</View>
	);
};

export default AllahNamesScreen;
