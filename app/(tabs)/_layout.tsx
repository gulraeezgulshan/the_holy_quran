import React from "react";
import { Tabs } from "expo-router";
import { Book, Bookmark, Headphones, Search } from "lucide-react-native";

const TabsLayout = () => {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					height: 60,
					paddingBottom: 8,
					paddingTop: 8,
					backgroundColor: "#ffffff",
					borderTopWidth: 1,
					borderTopColor: "#e5e5e5",
				},
				tabBarActiveTintColor: "#0066cc",
				tabBarInactiveTintColor: "#666666",
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
				},
			}}
		>
			<Tabs.Screen
				name="chapters"
				options={{
					title: "Read",
					tabBarIcon: ({ color, size }) => (
						<Book color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="bookmarks"
				options={{
					title: "Bookmarks",
					tabBarIcon: ({ color, size }) => (
						<Bookmark color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="listen"
				options={{
					title: "Listen",
					tabBarIcon: ({ color, size }) => (
						<Headphones color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color, size }) => (
						<Search color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
