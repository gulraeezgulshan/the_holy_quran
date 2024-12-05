import { Tabs } from "expo-router";
import { Book, Bookmark, Headphones, Search, Heart } from "lucide-react-native";

const TabsLayout = () => {
	return (
		<Tabs
			screenOptions={{
				animation: "none",
				headerShown: false,
				tabBarStyle: {
					height: 65,
					paddingBottom: 10,
					paddingTop: 10,
					backgroundColor: "#111827",
					borderTopColor: "#111827",
					shadowColor: "#111827",
					shadowOffset: {
						width: 0,
						height: -4,
					},
					shadowOpacity: 0.1,
					shadowRadius: 4,
					elevation: 5,
				},
				tabBarActiveTintColor: "#10B981",
				tabBarInactiveTintColor: "#9CA3AF",
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
					marginTop: 4,
				},
			}}
		>
			<Tabs.Screen
				name="chapters"
				options={{
					title: "Chapters",
					tabBarIcon: ({ color, size }) => (
						<Book color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="bookmarks"
				options={{
					title: "Bookmarks",
					tabBarIcon: ({ color, size }) => (
						<Bookmark color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="listen"
				options={{
					title: "Listen",
					tabBarIcon: ({ color, size }) => (
						<Headphones color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color, size }) => (
						<Search color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="dua"
				options={{
					title: "Dua",
					tabBarIcon: ({ color, size }) => (
						<Heart color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
