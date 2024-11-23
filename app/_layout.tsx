import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";
import { Stack } from "expo-router";

const RootLayout = () => {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="(verses)" />
			</Stack>
		</QueryClientProvider>
	);
};

export default RootLayout;
