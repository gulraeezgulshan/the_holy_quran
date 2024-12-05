import {
	Image,
	Pressable,
	Text,
	View,
	TextInput,
	ScrollView,
} from "react-native";
import {
	Search,
	Book,
	BookOpen,
	Calendar,
	Heart,
	ChevronRight,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { allahNames } from "../data/allah_name";
import { useQuery } from "@tanstack/react-query";
import { fetchRandomVerse } from "../query/verses";
import VerseItem from "../components/verse-item";

const dailyItems = {
	ayat: {
		title: "Ayat of the Day",
		content: '"Indeed, Allah is with those who are patient." - [2:153]',
	},
	word: {
		title: "Word of the Day",
		content: "Sabr (صبر) - Patience, perseverance, steadfastness",
	},
	event: {
		title: "Islamic Event",
		content: "Ramadan begins in 45 days",
	},
	dua: {
		title: "Dua of the Day",
		content:
			"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
	},
};

export default function App() {
	const [activeTab, setActiveTab] = useState("ayat");
	const [randomName, setRandomName] = useState(allahNames[0]);

	const { data: randomVerse, isLoading } = useQuery({
		queryKey: ["randomVerse"],
		queryFn: fetchRandomVerse,
	});

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * allahNames.length);
		setRandomName(allahNames[randomIndex]);
	}, []);

	const renderContent = () => (
		<View className="bg-gray-800 rounded-xl shadow-lg p-4 mx-4">
			<Text className="text-lg font-bold text-gray-100 mb-2">
				{dailyItems[activeTab].title}
			</Text>
			{activeTab === "ayat" ? (
				isLoading ? (
					<Text className="text-gray-300">Loading...</Text>
				) : (
					<VerseItem
						verse={randomVerse.verse}
						currentlyPlayingVerseKey={null}
						isAutoPlaying={false}
						onPlaybackStatusChange={() => {}}
						onPlaybackComplete={() => {}}
					/>
				)
			) : (
				<Text className="text-gray-300">
					{dailyItems[activeTab].content}
				</Text>
			)}
		</View>
	);

	return (
		<View className="flex-1 bg-gray-900">
			<View className="relative">
				<Image
					source={require("../assets/images/background_1.jpg")}
					className="w-full h-[250px] object-cover"
				/>
				<View className="absolute bottom-0 w-full translate-y-1/2 px-4 z-10">
					<View className="bg-gray-800 rounded-xl shadow-lg flex-row items-center px-4 py-3">
						<Search size={20} color="#9CA3AF" className="mr-2" />
						<TextInput
							placeholder="Search a word or a verse in Quran"
							placeholderTextColor="#9CA3AF"
							className="flex-1 text-base text-gray-100"
						/>
					</View>
				</View>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 24 }}
			>
				<View className="mt-[80px] mb-4">
					<View className="flex-row justify-around px-4">
						<Pressable
							onPress={() => setActiveTab("ayat")}
							className={`items-center px-6 justify-center ${
								activeTab === "ayat"
									? "bg-gray-800/30 rounded-lg"
									: ""
							}`}
						>
							<BookOpen
								size={24}
								color={
									activeTab === "ayat" ? "#10b981" : "#6B7280"
								}
							/>
							<Text
								className={`text-sm mt-1 ${
									activeTab === "ayat"
										? "text-gray-100"
										: "text-gray-400"
								}`}
							>
								Ayat
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setActiveTab("word")}
							className={`items-center px-6 py-2 justify-center ${
								activeTab === "word"
									? "bg-gray-800/30  rounded-lg"
									: ""
							}`}
						>
							<Book
								size={24}
								color={
									activeTab === "word" ? "#10b981" : "#6B7280"
								}
							/>
							<Text
								className={`text-sm mt-1 ${
									activeTab === "word"
										? "text-gray-100"
										: "text-gray-400"
								}`}
							>
								Word
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setActiveTab("event")}
							className={`items-center px-6 py-2 justify-center ${
								activeTab === "event"
									? "bg-gray-800/30  rounded-lg"
									: ""
							}`}
						>
							<Calendar
								size={24}
								color={
									activeTab === "event"
										? "#10b981"
										: "#6B7280"
								}
							/>
							<Text
								className={`text-sm mt-1 ${
									activeTab === "event"
										? "text-gray-100"
										: "text-gray-400"
								}`}
							>
								Event
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setActiveTab("dua")}
							className={`items-center px-6 py-2 justify-center ${
								activeTab === "dua"
									? "bg-gray-800/30  rounded-lg"
									: ""
							}`}
						>
							<Heart
								size={24}
								color={
									activeTab === "dua" ? "#10b981" : "#6B7280"
								}
							/>
							<Text
								className={`text-sm mt-1 ${
									activeTab === "dua"
										? "text-gray-100"
										: "text-gray-400"
								}`}
							>
								Dua
							</Text>
						</Pressable>
					</View>

					<View className="mt-4">{renderContent()}</View>
				</View>

				<View className="mt-6 px-4">
					<Text className="text-xl font-bold text-gray-100 mb-4">
						The Quran
					</Text>
					<Pressable
						onPress={() => router.push("/(tabs)/chapters")}
						className="bg-gray-800 rounded-xl shadow-lg p-4 flex-row justify-between items-center"
					>
						<View>
							<Text className="text-lg text-gray-100">
								All Chapters
							</Text>
							<Text className="text-sm text-gray-400">
								Browse all 114 Surahs
							</Text>
						</View>
						<ChevronRight size={20} color="#9CA3AF" />
					</Pressable>
				</View>

				<View className="mt-6 px-4">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-xl font-bold text-gray-100">
							Names of Allah
						</Text>
						<Pressable
							onPress={() =>
								router.push("/(screens)/allah-names")
							}
							className="flex-row items-center"
						>
							<Text className="text-sm text-gray-400 mr-1">
								View All
							</Text>
							<ChevronRight size={16} color="#9CA3AF" />
						</Pressable>
					</View>

					<View className="bg-gray-800 rounded-xl shadow-lg p-4">
						<View className="flex-row justify-between items-center py-3">
							<View>
								<Text className="text-2xl text-gray-100 mb-1">
									{randomName.name}
								</Text>
								<Text className="text-sm text-gray-400">
									{randomName.transliteration}
								</Text>
							</View>
							<Text className="text-base text-gray-300 flex-shrink max-w-[50%] text-right">
								{randomName.meaning}
							</Text>
							<Text className="text-base text-gray-300 flex-shrink max-w-[50%] text-right">
								{randomName.meaningUrdu}
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
