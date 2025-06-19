import type { PackageJson, TSConfig } from "pkg-types";

import type { Template } from "~/providers/better-t-stack/better-t-stack-types.ts";

export const DLER_TPL_FRONTEND: Template = {
  name: "frontend",
  description: "Template generated from 144 files",
  updatedAt: "2025-06-17T20:33:59.810Z",
  config: {
    files: {
      "frontend/native/native-base/assets/adaptive-icon.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "19b53640a9",
        },
        content: "",
        type: "binary",
        binaryHash: "19b53640a9",
      },
      "frontend/native/native-base/assets/favicon.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "cb25ca74dd",
        },
        content: "",
        type: "binary",
        binaryHash: "cb25ca74dd",
      },
      "frontend/native/native-base/assets/icon.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3f71f5a845",
        },
        content: "",
        type: "binary",
        binaryHash: "3f71f5a845",
      },
      "frontend/native/native-base/assets/splash.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "206a875d5d",
        },
        content: "",
        type: "binary",
        binaryHash: "206a875d5d",
      },
      "frontend/native/nativewind/app/(drawer)/(tabs)/index.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "27a5056910",
        },
        content: `import { Container } from "@/components/container";\nimport { ScrollView, Text, View } from "react-native";\n\nexport default function TabOne() {\n  return (\n    <Container>\n      <ScrollView className="flex-1 p-6">\n        <View className="py-8">\n          <Text className="text-3xl font-bold text-foreground mb-2">\n            Tab One\n          </Text>\n          <Text className="text-lg text-muted-foreground">\n            Explore the first section of your app\n          </Text>\n        </View>\n      </ScrollView>\n    </Container>\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/app/(drawer)/(tabs)/two.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "f53538fbaa",
        },
        content: `import { Container } from "@/components/container";\nimport { ScrollView, Text, View } from "react-native";\n\nexport default function TabTwo() {\n  return (\n    <Container>\n      <ScrollView className="flex-1 p-6">\n        <View className="py-8">\n          <Text className="text-3xl font-bold text-foreground mb-2">\n            Tab Two\n          </Text>\n          <Text className="text-lg text-muted-foreground">\n            Discover more features and content\n          </Text>\n        </View>\n      </ScrollView>\n    </Container>\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/app/(drawer)/(tabs)/_layout.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "dfbb2c9f9e",
        },
        content: `import { TabBarIcon } from "@/components/tabbar-icon";\nimport { useColorScheme } from "@/lib/use-color-scheme";\nimport { Tabs } from "expo-router";\n\nexport default function TabLayout() {\n  const { isDarkColorScheme } = useColorScheme();\n\n  return (\n    <Tabs\n      screenOptions={{\n        headerShown: false,\n        tabBarActiveTintColor: isDarkColorScheme\n          ? "hsl(217.2 91.2% 59.8%)"\n          : "hsl(221.2 83.2% 53.3%)",\n        tabBarInactiveTintColor: isDarkColorScheme\n          ? "hsl(215 20.2% 65.1%)"\n          : "hsl(215.4 16.3% 46.9%)",\n        tabBarStyle: {\n          backgroundColor: isDarkColorScheme\n            ? "hsl(222.2 84% 4.9%)"\n            : "hsl(0 0% 100%)",\n          borderTopColor: isDarkColorScheme\n            ? "hsl(217.2 32.6% 17.5%)"\n            : "hsl(214.3 31.8% 91.4%)",\n        },\n      }}\n    >\n      <Tabs.Screen\n        name="index"\n        options={{\n          title: "Home",\n          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,\n        }}\n      />\n      <Tabs.Screen\n        name="two"\n        options={{\n          title: "Explore",\n          tabBarIcon: ({ color }) => (\n            <TabBarIcon name="compass" color={color} />\n          ),\n        }}\n      />\n    </Tabs>\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/app/(drawer)/index.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "376c48bfd1",
        },
        content: `import { View, Text, ScrollView } from "react-native";\nimport { Container } from "@/components/container";\n{{#if (eq api "orpc")}}\nimport { useQuery } from "@tanstack/react-query";\nimport { orpc } from "@/utils/orpc";\n{{/if}}\n{{#if (eq api "trpc")}}\nimport { useQuery } from "@tanstack/react-query";\nimport { trpc } from "@/utils/trpc";\n{{/if}}\n{{#if (eq backend "convex")}}\nimport { useQuery } from "convex/react";\nimport { api } from "@{{ projectName }}/backend/convex/_generated/api";\n{{/if}}\n\nexport default function Home() {\n  {{#if (eq api "orpc")}}\n  const healthCheck = useQuery(orpc.healthCheck.queryOptions());\n  {{/if}}\n  {{#if (eq api "trpc")}}\n  const healthCheck = useQuery(trpc.healthCheck.queryOptions());\n  {{/if}}\n  {{#if (eq backend "convex")}}\n  const healthCheck = useQuery(api.healthCheck.get);\n  {{/if}}\n\n  return (\n    <Container>\n      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">\n        <Text className="font-mono text-foreground text-3xl font-bold mb-4">\n			BETTER T STACK\n		</Text>\n        <View className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">\n          {{#if (eq backend "convex")}}\n          <View className="flex-row items-center gap-3">\n            <View\n              className={\`h-3 w-3 rounded-full \${\n                  healthCheck ? "bg-green-500" : "bg-orange-500"\n              }\`}\n            />\n            <View className="flex-1">\n              <Text className="text-sm font-medium text-card-foreground">\n                Convex\n              </Text>\n              <Text className="text-xs text-muted-foreground">\n                {healthCheck === undefined\n                  ? "Checking connection..."\n                  : healthCheck === "OK"\n                    ? "All systems operational"\n                    : "Service unavailable"}\n              </Text>\n            </View>\n          </View>\n          {{else}}\n            {{#unless (eq api "none")}}\n            <View className="flex-row items-center gap-3">\n              <View\n                className={\`h-3 w-3 rounded-full \${\n                    healthCheck.data ? "bg-green-500" : "bg-orange-500"\n                }\`}\n              />\n              <View className="flex-1">\n                <Text className="text-sm font-medium text-card-foreground">\n                  {{#if (eq api "orpc")}}\n                  ORPC\n                  {{/if}}\n                  {{#if (eq api "trpc")}}\n                  TRPC\n                  {{/if}}\n                </Text>\n                <Text className="text-xs text-muted-foreground">\n                  {{#if (eq api "orpc")}}\n                  {healthCheck.isLoading\n                    ? "Checking connection..."\n                    : healthCheck.data\n                      ? "All systems operational"\n                      : "Service unavailable"}\n                  {{/if}}\n                  {{#if (eq api "trpc")}}\n                  {healthCheck.isLoading\n                    ? "Checking connection..."\n                    : healthCheck.data\n                      ? "All systems operational"\n                      : "Service unavailable"}\n                  {{/if}}\n                </Text>\n              </View>\n            </View>\n            {{/unless}}\n          {{/if}}\n        </View>\n      </ScrollView>\n    </Container>\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/app/(drawer)/_layout.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "9f2afabebd",
        },
        content: `import { Ionicons, MaterialIcons } from "@expo/vector-icons";\nimport { Link } from "expo-router";\nimport { Drawer } from "expo-router/drawer";\n\nimport { HeaderButton } from "@/components/header-button";\n\nconst DrawerLayout = () => {\n  return (\n    <Drawer>\n      <Drawer.Screen\n        name="index"\n        options={{\n          headerTitle: "Home",\n          drawerLabel: "Home",\n          drawerIcon: ({ size, color }) => (\n            <Ionicons name="home-outline" size={size} color={color} />\n          ),\n        }}\n      />\n      <Drawer.Screen\n        name="(tabs)"\n        options={{\n          headerTitle: "Tabs",\n          drawerLabel: "Tabs",\n          drawerIcon: ({ size, color }) => (\n            <MaterialIcons name="border-bottom" size={size} color={color} />\n          ),\n          headerRight: () => (\n            <Link href="/modal" asChild>\n              <HeaderButton />\n            </Link>\n          ),\n        }}\n      />\n      {{#if (includes examples "todo")}}\n      <Drawer.Screen\n        name="todos"\n        options={{\n          headerTitle: "Todos",\n          drawerLabel: "Todos",\n          drawerIcon: ({ size, color }) => (\n            <Ionicons name="checkbox-outline" size={size} color={color} />\n          ),\n        }}\n      />\n      {{/if}}\n      {{#if (includes examples "ai")}}\n      <Drawer.Screen\n        name="ai"\n        options={{\n          headerTitle: "AI",\n          drawerLabel: "AI",\n          drawerIcon: ({ size, color }) => (\n            <Ionicons\n              name="chatbubble-ellipses-outline"\n              size={size}\n              color={color}\n            />\n          ),\n        }}\n      />\n      {{/if}}\n    </Drawer>\n  );\n};\n\nexport default DrawerLayout;\n`,
        type: "text",
      },
      "frontend/native/nativewind/app/+html.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "01345c626a",
        },
        content: `import { ScrollViewStyleReset } from 'expo-router/html';\nimport { ReactNode } from 'react';\n\n// This file is web-only and used to configure the root HTML for every\n// web page during static rendering.\n// The contents of this function only run in Node.js environments and\n// do not have access to the DOM or browser APIs.\nexport default function Root({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <head>\n        <meta charSet="utf-8" />\n        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />\n\n        {/*\n          This viewport disables scaling which makes the mobile website act more like a native app.\n          However this does reduce built-in accessibility. If you want to enable scaling, use this instead:\n            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />\n        */}\n        <meta\n          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"\n          name="viewport"\n        />\n        {/*\n          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.\n          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.\n        */}\n        <ScrollViewStyleReset />\n\n        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}\n        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />\n        {/* Add any additional <head> elements that you want globally available on web... */}\n      </head>\n      <body>{children}</body>\n    </html>\n  );\n}\n\nconst responsiveBackground = \`\nbody {\n  background-color: #fff;\n}\n@media (prefers-color-scheme: dark) {\n  body {\n    background-color: #000;\n  }\n}\`;\n`,
        type: "text",
      },
      "frontend/native/nativewind/app/+not-found.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "c9300cea7e",
        },
        content: `import { Container } from "@/components/container";\nimport { Link, Stack } from "expo-router";\nimport { Text, View } from "react-native";\n\nexport default function NotFoundScreen() {\n  return (\n    <>\n      <Stack.Screen options={{ title: "Oops!" }} />\n      <Container>\n        <View className="flex-1 justify-center items-center p-6">\n          <View className="items-center">\n            <Text className="text-6xl mb-4">🤔</Text>\n            <Text className="text-2xl font-bold text-foreground mb-2 text-center">\n              Page Not Found\n            </Text>\n            <Text className="text-muted-foreground text-center mb-8 max-w-sm">\n              Sorry, the page you're looking for doesn't exist.\n            </Text>\n            <Link href="/" asChild>\n              <Text className="text-primary font-medium bg-primary/10 px-6 py-3 rounded-lg">\n                Go to Home\n              </Text>\n            </Link>\n          </View>\n        </View>\n      </Container>\n    </>\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/app/modal.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "61c53a4a93",
        },
        content: `import { Container } from "@/components/container";\nimport { Text, View } from "react-native";\n\nexport default function Modal() {\n  return (\n    <Container>\n      <View className="flex-1 p-6">\n        <View className="flex-row items-center justify-between mb-8">\n          <Text className="text-2xl font-bold text-foreground">Modal</Text>\n        </View>\n      </View>\n    </Container>\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/app/_layout.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "22be538e23",
        },
        content: `{{#if (includes examples "ai")}}\nimport "@/polyfills";\n{{/if}}\n{{#if (eq backend "convex")}}\nimport { ConvexProvider, ConvexReactClient } from "convex/react";\n{{else}}\n{{#unless (eq api "none")}}\nimport { QueryClientProvider } from "@tanstack/react-query";\n{{/unless}}\n{{/if}}\nimport { Stack } from "expo-router";\nimport {\n  DarkTheme,\n  DefaultTheme,\n  type Theme,\n  ThemeProvider,\n} from "@react-navigation/native";\nimport { StatusBar } from "expo-status-bar";\nimport { GestureHandlerRootView } from "react-native-gesture-handler";\nimport "../global.css";\n{{#if (eq api "trpc")}}\nimport { queryClient } from "@/utils/trpc";\n{{/if}}\n{{#if (eq api "orpc")}}\nimport { queryClient } from "@/utils/orpc";\n{{/if}}\nimport { NAV_THEME } from "@/lib/constants";\nimport React, { useRef } from "react";\nimport { useColorScheme } from "@/lib/use-color-scheme";\nimport { Platform } from "react-native";\nimport { setAndroidNavigationBar } from "@/lib/android-navigation-bar";\n\nconst LIGHT_THEME: Theme = {\n  ...DefaultTheme,\n  colors: NAV_THEME.light,\n};\nconst DARK_THEME: Theme = {\n  ...DarkTheme,\n  colors: NAV_THEME.dark,\n};\n\nexport const unstable_settings = {\n  initialRouteName: "(drawer)",\n};\n\n{{#if (eq backend "convex")}}\nconst convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {\n  unsavedChangesWarning: false,\n});\n{{/if}}\n\nexport default function RootLayout() {\n  const hasMounted = useRef(false);\n  const { colorScheme, isDarkColorScheme } = useColorScheme();\n  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);\n\n  useIsomorphicLayoutEffect(() => {\n    if (hasMounted.current) {\n      return;\n    }\n\n    if (Platform.OS === "web") {\n      document.documentElement.classList.add("bg-background");\n    }\n    setAndroidNavigationBar(colorScheme);\n    setIsColorSchemeLoaded(true);\n    hasMounted.current = true;\n  }, []);\n\n  if (!isColorSchemeLoaded) {\n    return null;\n  }\n  return (\n    {{#if (eq backend "convex")}}\n    <ConvexProvider client={convex}>\n      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>\n        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />\n        <GestureHandlerRootView style={{ flex: 1 }}>\n          <Stack>\n            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />\n            <Stack.Screen\n              name="modal"\n              options={{ title: "Modal", presentation: "modal" }}\n            />\n          </Stack>\n        </GestureHandlerRootView>\n      </ThemeProvider>\n    </ConvexProvider>\n    {{else}}\n    {{#unless (eq api "none")}}\n    <QueryClientProvider client={queryClient}>\n      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>\n        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />\n        <GestureHandlerRootView style={{ flex: 1 }}>\n          <Stack>\n            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />\n            <Stack.Screen\n              name="modal"\n              options={{ title: "Modal", presentation: "modal" }}\n            />\n          </Stack>\n        </GestureHandlerRootView>\n      </ThemeProvider>\n    </QueryClientProvider>\n    {{else}}\n    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>\n      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />\n      <GestureHandlerRootView style={{ flex: 1 }}>\n        <Stack>\n          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />\n          <Stack.Screen\n            name="modal"\n            options={{ title: "Modal", presentation: "modal" }}\n          />\n        </Stack>\n      </GestureHandlerRootView>\n    </ThemeProvider>\n    {{/unless}}\n    {{/if}}\n  );\n}\n\nconst useIsomorphicLayoutEffect =\n  Platform.OS === "web" && typeof window === "undefined"\n    ? React.useEffect\n    : React.useLayoutEffect;\n`,
        type: "text",
      },
      "frontend/native/nativewind/app-env.d.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "0309e174a4",
        },
        content: `// @ts-ignore\n/// <reference types="nativewind/types" />\n`,
        type: "text",
      },
      "frontend/native/nativewind/app.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "a33bfebe86",
        },
        content: {
          expo: {
            name: "my-better-t-app",
            slug: "my-better-t-app",
            version: "1.0.0",
            scheme: "my-better-t-app",
            web: {
              bundler: "metro",
              output: "static",
              favicon: "./assets/favicon.png",
            },
            plugins: ["expo-router", "expo-secure-store", "expo-web-browser"],
            experiments: {
              typedRoutes: true,
              tsconfigPaths: true,
            },
            newArchEnabled: true,
            orientation: "portrait",
            icon: "./assets/icon.png",
            userInterfaceStyle: "light",
            splash: {
              image: "./assets/splash.png",
              resizeMode: "contain",
              backgroundColor: "#ffffff",
            },
            assetBundlePatterns: ["**/*"],
            ios: {
              supportsTablet: true,
              bundleIdentifier: "com.amanvarshney01.mybettertapp",
            },
            android: {
              adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff",
              },
              package: "com.amanvarshney01.mybettertapp",
              edgeToEdgeEnabled: true,
            },
          },
        },
        type: "json",
      },
      "frontend/native/nativewind/babel.config.js": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "6b22e013c8",
        },
        content: `module.exports = function (api) {\n  api.cache(true);\n  const plugins = [];\n\n  plugins.push('react-native-reanimated/plugin');\n\n  return {\n    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],\n    plugins,\n  };\n};\n`,
        type: "text",
      },
      "frontend/native/nativewind/components/container.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "7a9ea19616",
        },
        content: `import React from "react";\nimport { SafeAreaView } from "react-native";\n\nexport const Container = ({ children }: { children: React.ReactNode }) => {\n  return (\n    <SafeAreaView className="flex-1 bg-background">{children}</SafeAreaView>\n  );\n};\n`,
        type: "text",
      },
      "frontend/native/nativewind/components/header-button.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "ea442dd11d",
        },
        content: `import FontAwesome from "@expo/vector-icons/FontAwesome";\nimport { forwardRef } from "react";\nimport { Pressable } from "react-native";\n\nexport const HeaderButton = forwardRef<\n  typeof Pressable,\n  { onPress?: () => void }\n>(({ onPress }, ref) => {\n  return (\n    <Pressable\n      onPress={onPress}\n      className="p-2 mr-2 rounded-lg bg-secondary/50 active:bg-secondary"\n    >\n      {({ pressed }) => (\n        <FontAwesome\n          name="info-circle"\n          size={20}\n          className="text-secondary-foreground"\n          style={{\n            opacity: pressed ? 0.7 : 1,\n          }}\n        />\n      )}\n    </Pressable>\n  );\n});\n`,
        type: "text",
      },
      "frontend/native/nativewind/components/tabbar-icon.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "ae6a7e3fb3",
        },
        content: `import FontAwesome from "@expo/vector-icons/FontAwesome";\n\nexport const TabBarIcon = (props: {\n  name: React.ComponentProps<typeof FontAwesome>["name"];\n  color: string;\n}) => {\n  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;\n};\n`,
        type: "text",
      },
      "frontend/native/nativewind/global.css": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "c42b9336d6",
        },
        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer base {\n  :root {\n    --background: 0 0% 100%;\n    --foreground: 222.2 84% 4.9%;\n    --card: 0 0% 100%;\n    --card-foreground: 222.2 84% 4.9%;\n    --popover: 0 0% 100%;\n    --popover-foreground: 222.2 84% 4.9%;\n    --primary: 221.2 83.2% 53.3%;\n    --primary-foreground: 210 40% 98%;\n    --secondary: 210 40% 96%;\n    --secondary-foreground: 222.2 84% 4.9%;\n    --muted: 210 40% 96%;\n    --muted-foreground: 215.4 16.3% 40%;\n    --accent: 210 40% 96%;\n    --accent-foreground: 222.2 84% 4.9%;\n    --destructive: 0 84.2% 60.2%;\n    --destructive-foreground: 210 40% 98%;\n    --border: 214.3 31.8% 91.4%;\n    --input: 214.3 31.8% 91.4%;\n    --ring: 221.2 83.2% 53.3%;\n    --radius: 8px;\n  }\n\n  .dark:root {\n    --background: 222.2 84% 4.9%;\n    --foreground: 210 40% 98%;\n    --card: 222.2 84% 4.9%;\n    --card-foreground: 210 40% 98%;\n    --popover: 222.2 84% 4.9%;\n    --popover-foreground: 210 40% 98%;\n    --primary: 217.2 91.2% 59.8%;\n    --primary-foreground: 222.2 84% 4.9%;\n    --secondary: 217.2 32.6% 17.5%;\n    --secondary-foreground: 210 40% 98%;\n    --muted: 217.2 32.6% 17.5%;\n    --muted-foreground: 215 20.2% 70%;\n    --accent: 217.2 32.6% 17.5%;\n    --accent-foreground: 210 40% 98%;\n    --destructive: 0 72% 51%;\n    --destructive-foreground: 210 40% 98%;\n    --border: 217.2 32.6% 17.5%;\n    --input: 217.2 32.6% 17.5%;\n    --ring: 224.3 76.3% 94.1%;\n  }\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/lib/android-navigation-bar.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "fcd7da609f",
        },
        content: `import * as NavigationBar from "expo-navigation-bar";\nimport { Platform } from "react-native";\nimport { NAV_THEME } from "@/lib/constants";\n\nexport async function setAndroidNavigationBar(theme: "light" | "dark") {\n  if (Platform.OS !== "android") return;\n  await NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");\n  await NavigationBar.setBackgroundColorAsync(\n    theme === "dark" ? NAV_THEME.dark.background : NAV_THEME.light.background,\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/lib/constants.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "308bab1835",
        },
        content: `export const NAV_THEME = {\n  light: {\n    background: "hsl(0 0% 100%)",\n    border: "hsl(220 13% 91%)",\n    card: "hsl(0 0% 100%)",\n    notification: "hsl(0 84.2% 60.2%)",\n    primary: "hsl(221.2 83.2% 53.3%)",\n    text: "hsl(222.2 84% 4.9%)",\n  },\n  dark: {\n    background: "hsl(222.2 84% 4.9%)",\n    border: "hsl(217.2 32.6% 17.5%)",\n    card: "hsl(222.2 84% 4.9%)",\n    notification: "hsl(0 72% 51%)",\n    primary: "hsl(217.2 91.2% 59.8%)",\n    text: "hsl(210 40% 98%)",\n  },\n};\n`,
        type: "text",
      },
      "frontend/native/nativewind/lib/use-color-scheme.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "a104869d85",
        },
        content: `import { useColorScheme as useNativewindColorScheme } from "nativewind";\n\nexport function useColorScheme() {\n  const { colorScheme, setColorScheme, toggleColorScheme } =\n    useNativewindColorScheme();\n  return {\n    colorScheme: colorScheme ?? "dark",\n    isDarkColorScheme: colorScheme === "dark",\n    setColorScheme,\n    toggleColorScheme,\n  };\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/metro.config.js": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "59a0d5ffd6",
        },
        content: `// Learn more https://docs.expo.io/guides/customizing-metro\nconst { getDefaultConfig } = require("expo/metro-config");\nconst { FileStore } = require("metro-cache");\nconst { withNativeWind } = require("nativewind/metro");\nconst path = require("node:path");\n\nconst config = withTurborepoManagedCache(\n  withMonorepoPaths(\n    withNativeWind(getDefaultConfig(__dirname), {\n      input: "./global.css",\n      configPath: "./tailwind.config.js",\n    }),\n  ),\n);\n\nconfig.resolver.unstable_enablePackageExports = true;\n\nconfig.resolver.disableHierarchicalLookup = true;\n\nmodule.exports = config;\n\n/**\n * Add the monorepo paths to the Metro config.\n * This allows Metro to resolve modules from the monorepo.\n *\n * @see https://docs.expo.dev/guides/monorepos/#modify-the-metro-config\n * @param {import('expo/metro-config').MetroConfig} config\n * @returns {import('expo/metro-config').MetroConfig}\n */\nfunction withMonorepoPaths(config) {\n  const projectRoot = __dirname;\n  const workspaceRoot = path.resolve(projectRoot, "../..");\n\n  // #1 - Watch all files in the monorepo\n  config.watchFolders = [workspaceRoot];\n\n  // #2 - Resolve modules within the project's \`node_modules\` first, then all monorepo modules\n  config.resolver.nodeModulesPaths = [\n    path.resolve(projectRoot, "node_modules"),\n    path.resolve(workspaceRoot, "node_modules"),\n  ];\n\n  return config;\n}\n\n/**\n * Move the Metro cache to the \`.cache/metro\` folder.\n * If you have any environment variables, you can configure Turborepo to invalidate it when needed.\n *\n * @see https://turbo.build/repo/docs/reference/configuration#env\n * @param {import('expo/metro-config').MetroConfig} config\n * @returns {import('expo/metro-config').MetroConfig}\n */\nfunction withTurborepoManagedCache(config) {\n  config.cacheStores = [\n    new FileStore({ root: path.join(__dirname, ".cache/metro") }),\n  ];\n  return config;\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/package.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "f54263cddd",
        },
        content: `{\n  "name": "native",\n  "version": "1.0.0",\n  "main": "expo-router/entry",\n  "scripts": {\n    "dev": "expo start --clear",\n    "android": "expo run:android",\n    "ios": "expo run:ios",\n    "prebuild": "expo prebuild",\n    "web": "expo start --web"\n  },\n  "dependencies": {\n    "@expo/vector-icons": "^14.0.4",\n    "@react-navigation/bottom-tabs": "^7.2.0",\n    "@react-navigation/drawer": "^7.1.1",\n    "@react-navigation/native": "^7.0.14",\n    "@tanstack/react-form": "^1.0.5",\n    "@tanstack/react-query": "^5.69.2",\n    {{#if (includes examples "ai")}}\n    "@stardazed/streams-text-encoding": "^1.0.2",\n    "@ungap/structured-clone": "^1.3.0",\n    {{/if}}\n    "expo": "^53.0.4",\n    "expo-constants": "~17.1.4",\n    "expo-linking": "~7.1.4",\n    "expo-navigation-bar": "~4.2.3",\n    "expo-router": "~5.0.3",\n    "expo-secure-store": "~14.2.3",\n    "expo-status-bar": "~2.2.3",\n    "expo-system-ui": "~5.0.6",\n    "expo-web-browser": "~14.1.6",\n    "nativewind": "^4.1.23",\n    "react": "19.0.0",\n    "react-dom": "19.0.0",\n    "react-native": "0.79.1",\n    "react-native-gesture-handler": "~2.24.0",\n    "react-native-reanimated": "~3.17.4",\n    "react-native-safe-area-context": "5.3.0",\n    "react-native-screens": "~4.10.0",\n    "react-native-web": "^0.20.0"\n  },\n  "devDependencies": {\n    "@babel/core": "^7.26.10",\n    "@types/react": "~19.0.10",\n    "tailwindcss": "^3.4.17",\n    "typescript": "~5.8.2"\n  },\n  "private": true\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/tailwind.config.js": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "7ac6f20414",
        },
        content: `const { hairlineWidth } = require("nativewind/theme");\n\n/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  darkMode: "class",\n  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}"],\n\n  presets: [require("nativewind/preset")],\n  theme: {\n    extend: {\n      colors: {\n        background: "hsl(var(--background))",\n        foreground: "hsl(var(--foreground))",\n        card: {\n          DEFAULT: "hsl(var(--card))",\n          foreground: "hsl(var(--card-foreground))",\n        },\n        popover: {\n          DEFAULT: "hsl(var(--popover))",\n          foreground: "hsl(var(--popover-foreground))",\n        },\n        primary: {\n          DEFAULT: "hsl(var(--primary))",\n          foreground: "hsl(var(--primary-foreground))",\n        },\n        secondary: {\n          DEFAULT: "hsl(var(--secondary))",\n          foreground: "hsl(var(--secondary-foreground))",\n        },\n        muted: {\n          DEFAULT: "hsl(var(--muted))",\n          foreground: "hsl(var(--muted-foreground))",\n        },\n        accent: {\n          DEFAULT: "hsl(var(--accent))",\n          foreground: "hsl(var(--accent-foreground))",\n        },\n        destructive: {\n          DEFAULT: "hsl(var(--destructive))",\n          foreground: "hsl(var(--destructive-foreground))",\n        },\n        border: "hsl(var(--border))",\n        input: "hsl(var(--input))",\n        ring: "hsl(var(--ring))",\n        radius: "var(--radius)",\n      },\n      borderRadius: {\n        xl: "calc(var(--radius) + 4px)",\n        lg: "var(--radius)",\n        md: "calc(var(--radius) - 2px)",\n        sm: "calc(var(--radius) - 4px)",\n      },\n      borderWidth: {\n        hairline: hairlineWidth(),\n      },\n    },\n  },\n  plugins: [],\n};\n`,
        type: "text",
      },
      "frontend/native/nativewind/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d135042b9e",
        },
        content: `{\n  "extends": "expo/tsconfig.base",\n  "compilerOptions": {\n    "strict": true,\n    "paths": {\n      "@/*": [\n        "./*"\n      ]\n    }\n  },\n  "include": [\n    "**/*.ts",\n    "**/*.tsx",\n    ".expo/types/**/*.ts",\n    "expo-env.d.ts",\n    "nativewind-env.d.ts"\n  ],\n  {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n}\n`,
        type: "text",
      },
      "frontend/native/nativewind/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "dc295f33bd",
        },
        content: `node_modules/\n.expo/\ndist/\nnpm-debug.*\n*.jks\n*.p8\n*.p12\n*.key\n*.mobileprovision\n*.orig.*\nweb-build/\n# expo router\nexpo-env.d.ts\n\n.env\n.cache\n\nios\nandroid\n\n# macOS\n.DS_Store\n\n# Temporary files created by Metro to check the health of the file watcher\n.metro-health-check*\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/(drawer)/(tabs)/index.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "305e0922ef",
        },
        content: `import { Container } from "@/components/container";\nimport { ScrollView, Text, View } from "react-native";\nimport { StyleSheet } from "react-native-unistyles";\n\nexport default function Home() {\n  return (\n    <Container>\n      <ScrollView contentContainerStyle={styles.container}>\n        <View style={styles.headerSection}>\n          <Text style={styles.title}>Tab One</Text>\n          <Text style={styles.subtitle}>\n            Explore the first section of your app\n          </Text>\n        </View>\n      </ScrollView>\n    </Container>\n  );\n}\n\nconst styles = StyleSheet.create((theme) => ({\n  container: {\n    padding: theme.spacing.lg,\n  },\n  headerSection: {\n    paddingVertical: theme.spacing.xl,\n  },\n  title: {\n    fontSize: theme.fontSize["3xl"],\n    fontWeight: "bold",\n    color: theme.colors.foreground,\n    marginBottom: theme.spacing.sm,\n  },\n  subtitle: {\n    fontSize: theme.fontSize.lg,\n    color: theme.colors.mutedForeground,\n  },\n}));\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/(drawer)/(tabs)/two.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d81d62ca2c",
        },
        content: `import { Container } from "@/components/container";\nimport { ScrollView, Text, View } from "react-native";\nimport { StyleSheet } from "react-native-unistyles";\n\nexport default function TabTwo() {\n  return (\n    <Container>\n      <ScrollView contentContainerStyle={styles.container}>\n        <View style={styles.headerSection}>\n          <Text style={styles.title}>Tab Two</Text>\n          <Text style={styles.subtitle}>\n            Discover more features and content\n          </Text>\n        </View>\n      </ScrollView>\n    </Container>\n  );\n}\n\nconst styles = StyleSheet.create((theme) => ({\n  container: {\n    padding: theme.spacing.lg,\n  },\n  headerSection: {\n    paddingVertical: theme.spacing.xl,\n  },\n  title: {\n    fontSize: theme.fontSize["3xl"],\n    fontWeight: "bold",\n    color: theme.colors.foreground,\n    marginBottom: theme.spacing.sm,\n  },\n  subtitle: {\n    fontSize: theme.fontSize.lg,\n    color: theme.colors.mutedForeground,\n  },\n}));\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/(drawer)/(tabs)/_layout.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "37617a510a",
        },
        content: `import { Tabs } from "expo-router";\nimport { useUnistyles } from "react-native-unistyles";\n\nimport { TabBarIcon } from "@/components/tabbar-icon";\n\nexport default function TabLayout() {\n  const { theme } = useUnistyles();\n\n  return (\n    <Tabs\n      screenOptions={{\n        headerShown: false,\n        tabBarActiveTintColor: theme.colors.primary,\n        tabBarInactiveTintColor: theme.colors.mutedForeground,\n        tabBarStyle: {\n          backgroundColor: theme.colors.background,\n          borderTopColor: theme.colors.border,\n        },\n      }}\n    >\n      <Tabs.Screen\n        name="index"\n        options={{\n          title: "Home",\n          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,\n        }}\n      />\n      <Tabs.Screen\n        name="two"\n        options={{\n          title: "Explore",\n          tabBarIcon: ({ color }) => (\n            <TabBarIcon name="compass" color={color} />\n          ),\n        }}\n      />\n    </Tabs>\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/(drawer)/index.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b76ab44b56",
        },
        content: `import { ScrollView, Text, View } from "react-native";\nimport { StyleSheet } from "react-native-unistyles";\nimport { Container } from "@/components/container";\n\n{{#if (eq api "orpc")}}\nimport { useQuery } from "@tanstack/react-query";\nimport { orpc } from "@/utils/orpc";\n{{/if}}\n{{#if (eq api "trpc")}}\nimport { useQuery } from "@tanstack/react-query";\nimport { trpc } from "@/utils/trpc";\n{{/if}}\n{{#if (eq backend "convex")}}\nimport { useQuery } from "convex/react";\nimport { api } from "@{{ projectName }}/backend/convex/_generated/api";\n{{/if}}\n\nexport default function Home() {\n  {{#if (eq api "orpc")}}\n  const healthCheck = useQuery(orpc.healthCheck.queryOptions());\n  {{/if}}\n  {{#if (eq api "trpc")}}\n  const healthCheck = useQuery(trpc.healthCheck.queryOptions());\n  {{/if}}\n  {{#if (eq backend "convex")}}\n  const healthCheck = useQuery(api.healthCheck.get);\n  {{/if}}\n\n  return (\n    <Container>\n      <ScrollView\n        contentContainerStyle={styles.container}\n        showsVerticalScrollIndicator={false}\n      >\n        <Text className="font-mono text-foreground text-3xl font-bold mb-4">\n			BETTER T STACK\n		</Text>\n        <View style={styles.statusCard}>\n          <View style={styles.statusHeader}>\n            <Text style={styles.statusTitle}>System Status</Text>\n            <View style={styles.statusBadge}>\n              <Text style={styles.statusBadgeText}>LIVE</Text>\n            </View>\n          </View>\n\n          {{#if (eq backend "convex")}}\n          <View style={styles.statusRow}>\n            <View\n              style={[\n                styles.statusDot,\n                healthCheck === "OK"\n                  ? styles.statusDotSuccess\n                  : styles.statusDotWarning,\n              ]}\n            />\n            <View style={styles.statusContent}>\n              <Text style={styles.statusLabel}>Convex</Text>\n              <Text style={styles.statusDescription}>\n                {healthCheck === undefined\n                  ? "Checking connection..."\n                  : healthCheck === "OK"\n                    ? "All systems operational"\n                    : "Service unavailable"}\n              </Text>\n            </View>\n          </View>\n          {{else}}\n            {{#unless (eq api "none")}}\n            <View style={styles.statusRow}>\n              <View\n                style={[\n                  styles.statusDot,\n                  healthCheck.data\n                    ? styles.statusDotSuccess\n                    : styles.statusDotWarning,\n                ]}\n              />\n              <View style={styles.statusContent}>\n                <Text style={styles.statusLabel}>\n                  {{#if (eq api "orpc")}}\n                  ORPC\n                  {{/if}}\n                  {{#if (eq api "trpc")}}\n                  TRPC\n                  {{/if}}\n                </Text>\n                <Text style={styles.statusDescription}>\n                  {{#if (eq api "orpc")}}\n                  {healthCheck.isLoading\n                    ? "Checking connection..."\n                    : healthCheck.data\n                      ? "All systems operational"\n                      : "Service unavailable"}\n                  {{/if}}\n                  {{#if (eq api "trpc")}}\n                  {healthCheck.isLoading\n                    ? "Checking connection..."\n                    : healthCheck.data\n                      ? "All systems operational"\n                      : "Service unavailable"}\n                  {{/if}}\n                </Text>\n              </View>\n            </View>\n            {{/unless}}\n          {{/if}}\n        </View>\n      </ScrollView>\n    </Container>\n  );\n}\n\nconst styles = StyleSheet.create((theme) => ({\n  container: {\n    paddingHorizontal: theme.spacing.md,\n  },\n  heroSection: {\n    paddingVertical: theme.spacing.xl,\n  },\n  heroTitle: {\n    fontSize: theme.fontSize["4xl"],\n    fontWeight: "bold",\n    color: theme.colors.foreground,\n    marginBottom: theme.spacing.sm,\n  },\n  heroSubtitle: {\n    fontSize: theme.fontSize.lg,\n    color: theme.colors.mutedForeground,\n    lineHeight: 28,\n  },\n  statusCard: {\n    backgroundColor: theme.colors.card,\n    borderWidth: 1,\n    borderColor: theme.colors.border,\n    borderRadius: theme.borderRadius.xl,\n    padding: theme.spacing.lg,\n    marginBottom: theme.spacing.lg,\n    shadowColor: "#000",\n    shadowOffset: { width: 0, height: 1 },\n    shadowOpacity: 0.05,\n    shadowRadius: 3,\n    elevation: 2,\n  },\n  statusHeader: {\n    flexDirection: "row",\n    alignItems: "center",\n    justifyContent: "space-between",\n    marginBottom: theme.spacing.md,\n  },\n  statusTitle: {\n    fontSize: theme.fontSize.lg,\n    fontWeight: "600",\n    color: theme.colors.cardForeground,\n  },\n  statusBadge: {\n    backgroundColor: theme.colors.secondary,\n    paddingHorizontal: theme.spacing.sm + 4,\n    paddingVertical: theme.spacing.xs,\n    borderRadius: 9999,\n  },\n  statusBadgeText: {\n    fontSize: theme.fontSize.xs,\n    fontWeight: "500",\n    color: theme.colors.secondaryForeground,\n  },\n  statusRow: {\n    flexDirection: "row",\n    alignItems: "center",\n    gap: theme.spacing.sm + 4,\n  },\n  statusDot: {\n    height: 12,\n    width: 12,\n    borderRadius: 6,\n  },\n  statusDotSuccess: {\n    backgroundColor: theme.colors.success,\n  },\n  statusDotWarning: {\n    backgroundColor: "#F59E0B",\n  },\n  statusContent: {\n    flex: 1,\n  },\n  statusLabel: {\n    fontSize: theme.fontSize.sm,\n    fontWeight: "500",\n    color: theme.colors.cardForeground,\n  },\n  statusDescription: {\n    fontSize: theme.fontSize.xs,\n    color: theme.colors.mutedForeground,\n  }\n}));\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/(drawer)/_layout.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "825ba9cffb",
        },
        content: `import { Ionicons, MaterialIcons } from "@expo/vector-icons";\nimport { Link } from "expo-router";\nimport { Drawer } from "expo-router/drawer";\nimport { useUnistyles } from "react-native-unistyles";\n\nimport { HeaderButton } from "../../components/header-button";\n\nconst DrawerLayout = () => {\n  const { theme } = useUnistyles();\n\n  return (\n    <Drawer\n      screenOptions={{\n        headerStyle: {\n          backgroundColor: theme.colors.background,\n        },\n        headerTitleStyle: {\n          color: theme.colors.foreground,\n        },\n        headerTintColor: theme.colors.foreground,\n        drawerStyle: {\n          backgroundColor: theme.colors.background,\n        },\n        drawerLabelStyle: {\n          color: theme.colors.foreground,\n        },\n        drawerInactiveTintColor: theme.colors.mutedForeground,\n      }}\n    >\n      <Drawer.Screen\n        name="index"\n        options={{\n          headerTitle: "Home",\n          drawerLabel: "Home",\n          drawerIcon: ({ size, color }) => (\n            <Ionicons name="home-outline" size={size} color={color} />\n          ),\n        }}\n      />\n      <Drawer.Screen\n        name="(tabs)"\n        options={{\n          headerTitle: "Tabs",\n          drawerLabel: "Tabs",\n          drawerIcon: ({ size, color }) => (\n            <MaterialIcons name="border-bottom" size={size} color={color} />\n          ),\n          headerRight: () => (\n            <Link href="/modal" asChild>\n              <HeaderButton />\n            </Link>\n          ),\n        }}\n      />\n      {{#if (includes examples "todo")}}\n      <Drawer.Screen\n        name="todos"\n        options={{\n          headerTitle: "Todos",\n          drawerLabel: "Todos",\n          drawerIcon: ({ size, color }) => (\n            <Ionicons name="checkbox-outline" size={size} color={color} />\n          ),\n        }}\n      />\n      {{/if}}\n      {{#if (includes examples "ai")}}\n      <Drawer.Screen\n        name="ai"\n        options={{\n          headerTitle: "AI",\n          drawerLabel: "AI",\n          drawerIcon: ({ size, color }) => (\n            <Ionicons\n              name="chatbubble-ellipses-outline"\n              size={size}\n              color={color}\n            />\n          ),\n        }}\n      />\n      {{/if}}\n    </Drawer>\n  );\n};\n\nexport default DrawerLayout;\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/+html.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "390b55789f",
        },
        content: `import { ScrollViewStyleReset } from 'expo-router/html';\n\nimport '../unistyles';\n\n// This file is web-only and used to configure the root HTML for every\n// web page during static rendering.\n// The contents of this function only run in Node.js environments and\n// do not have access to the DOM or browser APIs.\nexport default function Root({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <head>\n        <meta charSet="utf-8" />\n        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />\n\n        {/*\n          This viewport disables scaling which makes the mobile website act more like a native app.\n          However this does reduce built-in accessibility. If you want to enable scaling, use this instead:\n            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />\n        */}\n        <meta\n          name="viewport"\n          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"\n        />\n        {/*\n          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.\n          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.\n        */}\n        <ScrollViewStyleReset />\n\n        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}\n        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />\n        {/* Add any additional <head> elements that you want globally available on web... */}\n      </head>\n      <body>{children}</body>\n    </html>\n  );\n}\n\nconst responsiveBackground = \`\nbody {\n  background-color: #fff;\n}\n@media (prefers-color-scheme: dark) {\n  body {\n    background-color: #000;\n  }\n}\`;\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/+not-found.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "5b81a69416",
        },
        content: `import { Container } from "@/components/container";\nimport { Link, Stack } from "expo-router";\nimport { Text, View } from "react-native";\nimport { StyleSheet } from "react-native-unistyles";\n\nexport default function NotFoundScreen() {\n  return (\n    <>\n      <Stack.Screen options={{ title: "Oops!" }} />\n      <Container>\n        <View style={styles.container}>\n          <View style={styles.content}>\n            <Text style={styles.emoji}>🤔</Text>\n            <Text style={styles.title}>Page Not Found</Text>\n            <Text style={styles.description}>\n              Sorry, the page you're looking for doesn't exist.\n            </Text>\n            <Link href="/" style={styles.button}>\n              <Text style={styles.buttonText}>Go to Home</Text>\n            </Link>\n          </View>\n        </View>\n      </Container>\n    </>\n  );\n}\n\nconst styles = StyleSheet.create((theme) => ({\n  container: {\n    flex: 1,\n    justifyContent: "center",\n    alignItems: "center",\n    padding: theme.spacing.lg,\n  },\n  content: {\n    alignItems: "center",\n  },\n  emoji: {\n    fontSize: 64,\n    marginBottom: theme.spacing.md,\n  },\n  title: {\n    fontSize: theme.fontSize["2xl"],\n    fontWeight: "bold",\n    color: theme.colors.foreground,\n    marginBottom: theme.spacing.sm,\n    textAlign: "center",\n  },\n  description: {\n    color: theme.colors.mutedForeground,\n    textAlign: "center",\n    marginBottom: theme.spacing.xl,\n    maxWidth: 280,\n  },\n  button: {\n    backgroundColor: \`\${theme.colors.primary}1A\`, // 10% opacity\n    paddingHorizontal: theme.spacing.lg,\n    paddingVertical: theme.spacing.sm + 4,\n    borderRadius: theme.borderRadius.lg,\n  },\n  buttonText: {\n    color: theme.colors.primary,\n    fontWeight: "500",\n  },\n}));\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/modal.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "a7e295903b",
        },
        content: `import { Container } from "@/components/container";\nimport { Text, View } from "react-native";\nimport { StyleSheet } from "react-native-unistyles";\n\nexport default function Modal() {\n  return (\n    <Container>\n      <View style={styles.container}>\n        <View style={styles.header}>\n          <Text style={styles.title}>Modal</Text>\n        </View>\n      </View>\n    </Container>\n  );\n}\n\nconst styles = StyleSheet.create((theme) => ({\n  container: {\n    flex: 1,\n    padding: theme.spacing.lg,\n  },\n  header: {\n    flexDirection: "row",\n    alignItems: "center",\n    justifyContent: "space-between",\n    marginBottom: theme.spacing.xl,\n  },\n  title: {\n    fontSize: theme.fontSize["2xl"],\n    fontWeight: "bold",\n    color: theme.colors.foreground,\n  },\n}));\n`,
        type: "text",
      },
      "frontend/native/unistyles/app/_layout.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "57f8a73570",
        },
        content: `{{#if (includes examples "ai")}}\nimport "@/polyfills";\n{{/if}}\n{{#if (eq api "trpc")}}\nimport { queryClient } from "@/utils/trpc";\n{{/if}}\n{{#if (eq api "orpc")}}\nimport { queryClient } from "@/utils/orpc";\n{{/if}}\n{{#if (eq backend "convex")}}\nimport { ConvexProvider, ConvexReactClient } from "convex/react";\n{{else}}\n  {{#unless (eq api "none")}}\nimport { QueryClientProvider } from "@tanstack/react-query";\n  {{/unless}}\n{{/if}}\nimport { Stack } from "expo-router";\nimport { GestureHandlerRootView } from "react-native-gesture-handler";\nimport { useUnistyles } from "react-native-unistyles";\n\nexport const unstable_settings = {\n  // Ensure that reloading on \`/modal\` keeps a back button present.\n  initialRouteName: "(drawer)",\n};\n\n{{#if (eq backend "convex")}}\nconst convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {\n  unsavedChangesWarning: false,\n});\n{{/if}}\n\nexport default function RootLayout() {\n  const { theme } = useUnistyles();\n\n  return (\n    {{#if (eq backend "convex")}}\n    <ConvexProvider client={convex}>\n      <GestureHandlerRootView style={{ flex: 1 }}>\n        <Stack\n          screenOptions={{\n            headerStyle: {\n              backgroundColor: theme.colors.background,\n            },\n            headerTitleStyle: {\n              color: theme.colors.foreground,\n            },\n            headerTintColor: theme.colors.foreground,\n          }}\n        >\n          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />\n          <Stack.Screen\n            name="modal"\n            options={{ title: "Modal", presentation: "modal" }}\n          />\n        </Stack>\n      </GestureHandlerRootView>\n    </ConvexProvider>\n    {{else}}\n      {{#unless (eq api "none")}}\n    <QueryClientProvider client={queryClient}>\n      <GestureHandlerRootView style={{ flex: 1 }}>\n        <Stack\n          screenOptions={{\n            headerStyle: {\n              backgroundColor: theme.colors.background,\n            },\n            headerTitleStyle: {\n              color: theme.colors.foreground,\n            },\n            headerTintColor: theme.colors.foreground,\n          }}\n        >\n          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />\n          <Stack.Screen\n            name="modal"\n            options={{ title: "Modal", presentation: "modal" }}\n          />\n        </Stack>\n      </GestureHandlerRootView>\n    </QueryClientProvider>\n      {{else}}\n      <GestureHandlerRootView style={{ flex: 1 }}>\n        <Stack\n          screenOptions={{\n            headerStyle: {\n              backgroundColor: theme.colors.background,\n            },\n            headerTitleStyle: {\n              color: theme.colors.foreground,\n            },\n            headerTintColor: theme.colors.foreground,\n          }}\n        >\n          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />\n          <Stack.Screen\n            name="modal"\n            options={{ title: "Modal", presentation: "modal" }}\n          />\n        </Stack>\n      </GestureHandlerRootView>\n      {{/unless}}\n    {{/if}}\n  );\n}\n`,
        type: "text",
      },
      "frontend/native/unistyles/app.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "448f6a6f66",
        },
        content: {
          expo: {
            name: "my-better-t-app",
            slug: "my-better-t-app",
            version: "1.0.0",
            newArchEnabled: true,
            scheme: "my-better-t-app",
            web: {
              bundler: "metro",
              output: "static",
              favicon: "./assets/favicon.png",
            },
            plugins: [
              "expo-router",
              "react-native-edge-to-edge",
              "expo-secure-store",
            ],
            experiments: {
              typedRoutes: true,
              tsconfigPaths: true,
              reactCompiler: true,
            },
            orientation: "portrait",
            icon: "./assets/icon.png",
            userInterfaceStyle: "automatic",
            splash: {
              image: "./assets/splash.png",
              resizeMode: "contain",
              backgroundColor: "#ffffff",
            },
            assetBundlePatterns: ["**/*"],
            ios: {
              supportsTablet: true,
              bundleIdentifier: "com.amanvarshney01.mybettertapp",
            },
            android: {
              adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff",
              },
              package: "com.amanvarshney01.mybettertapp",
            },
          },
        },
        type: "json",
      },
      "frontend/native/unistyles/babel.config.js": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "04962e21ef",
        },
        content: `module.exports = function (api) {\n  api.cache(true);\n  const plugins = [];\n\n  plugins.push([\n    'react-native-unistyles/plugin',\n    {\n      autoProcessRoot: 'app',\n      autoProcessImports: ['@/components'],\n    },\n  ]);\n\n  plugins.push('react-native-reanimated/plugin');\n\n  return {\n    presets: ['babel-preset-expo'],\n\n    plugins,\n  };\n};\n`,
        type: "text",
      },
      "frontend/native/unistyles/breakpoints.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "98b71994c0",
        },
        content: `export const breakpoints = {\n  xs: 0,\n  sm: 576,\n  md: 768,\n  lg: 992,\n  xl: 1200,\n  superLarge: 2000,\n  tvLike: 4000,\n} as const;\n`,
        type: "text",
      },
      "frontend/native/unistyles/components/container.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "4bac86e063",
        },
        content: `import React from "react";\nimport { SafeAreaView } from "react-native";\nimport { StyleSheet } from "react-native-unistyles";\n\nexport const Container = ({ children }: { children: React.ReactNode }) => {\n  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;\n};\n\nconst styles = StyleSheet.create((theme, rt) => ({\n  container: {\n    flex: 1,\n    backgroundColor: theme.colors.background,\n    paddingBottom: rt.insets.bottom,\n  },\n}));\n`,
        type: "text",
      },
      "frontend/native/unistyles/components/header-button.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "fbc784ab04",
        },
        content: `import FontAwesome from "@expo/vector-icons/FontAwesome";\nimport { forwardRef } from "react";\nimport { Pressable } from "react-native";\nimport { StyleSheet } from "react-native-unistyles";\n\nexport const HeaderButton = forwardRef<\n  typeof Pressable,\n  { onPress?: () => void }\n>(({ onPress }, ref) => {\n  return (\n    <Pressable onPress={onPress} style={styles.button}>\n      {({ pressed }) => (\n        <FontAwesome\n          name="info-circle"\n          size={20}\n          color={styles.icon.color}\n          style={{\n            opacity: pressed ? 0.7 : 1,\n          }}\n        />\n      )}\n    </Pressable>\n  );\n});\n\nconst styles = StyleSheet.create((theme) => ({\n  button: {\n    padding: theme.spacing.sm,\n    marginRight: theme.spacing.sm,\n    borderRadius: theme.borderRadius.lg,\n    backgroundColor: \`\${theme.colors.secondary}80\`, // 50% opacity\n  },\n  icon: {\n    color: theme.colors.secondaryForeground,\n  },\n}));\n`,
        type: "text",
      },
      "frontend/native/unistyles/components/tabbar-icon.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "ae6a7e3fb3",
        },
        content: `import FontAwesome from "@expo/vector-icons/FontAwesome";\n\nexport const TabBarIcon = (props: {\n  name: React.ComponentProps<typeof FontAwesome>["name"];\n  color: string;\n}) => {\n  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;\n};\n`,
        type: "text",
      },
      "frontend/native/unistyles/expo-env.d.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d4f8cc7190",
        },
        content: `/// <reference types="expo/types" />\n\n// NOTE: This file should not be edited and should be in your git ignore`,
        type: "text",
      },
      "frontend/native/unistyles/index.js": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e21391085e",
        },
        content: `import 'expo-router/entry';\nimport './unistyles';\n`,
        type: "text",
      },
      "frontend/native/unistyles/metro.config.js": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "88c915d889",
        },
        content: `// Learn more https://docs.expo.io/guides/customizing-metro\nconst { getDefaultConfig } = require("expo/metro-config");\nconst path = require("path");\n\nconst workspaceRoot = path.resolve(__dirname, "../..");\nconst projectRoot = __dirname;\n\nconst config = getDefaultConfig(projectRoot);\n\n// 1. Watch all files within the monorepo\nconfig.watchFolders = [workspaceRoot];\n// 2. Let Metro know where to resolve packages, and in what order\nconfig.resolver.nodeModulesPaths = [\n  path.resolve(projectRoot, "node_modules"),\n  path.resolve(workspaceRoot, "node_modules"),\n];\n// 3. Force Metro to resolve (sub)dependencies only from the \`nodeModulesPaths\`\nconfig.resolver.disableHierarchicalLookup = true;\n\nmodule.exports = config;\n`,
        type: "text",
      },
      "frontend/native/unistyles/package.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "6154b48f4d",
        },
        content: `{\n  "name": "native",\n  "version": "1.0.0",\n  "main": "index.js",\n  "scripts": {\n    "dev": "expo start --clear",\n    "android": "expo run:android",\n    "ios": "expo run:ios",\n    "web": "expo start --web"\n  },\n  "dependencies": {\n    "@expo/vector-icons": "^14.0.0",\n    "@react-navigation/bottom-tabs": "^7.0.5",\n    "@react-navigation/drawer": "^7.0.0",\n    "@react-navigation/native": "^7.0.3",\n    {{#if (includes examples "ai")}}\n    "@stardazed/streams-text-encoding": "^1.0.2",\n    "@ungap/structured-clone": "^1.3.0",\n    {{/if}}\n    "@tanstack/react-form": "^1.0.5",\n    "babel-plugin-react-compiler": "^19.0.0-beta-af1b7da-20250417",\n    "expo": "^53.0.8",\n    "expo-constants": "~17.1.4",\n    "expo-linking": "~7.1.4",\n    "expo-router": "~5.0.3",\n    "expo-secure-store": "~14.2.3",\n    "expo-status-bar": "~2.2.3",\n    "expo-system-ui": "~5.0.6",\n    "expo-dev-client": "~5.1.8",\n    "expo-web-browser": "~14.1.6",\n    "react": "19.0.0",\n    "react-dom": "19.0.0",\n    "react-native": "0.79.2",\n    "react-native-edge-to-edge": "1.6.0",\n    "react-native-gesture-handler": "~2.24.0",\n    "react-native-nitro-modules": "0.25.2",\n    "react-native-reanimated": "~3.17.4",\n    "react-native-safe-area-context": "5.4.0",\n    "react-native-screens": "~4.10.0",\n    "react-native-unistyles": "^3.0.0-rc.4",\n    "react-native-web": "^0.20.0"\n  },\n  "devDependencies": {\n    "ajv": "^8.12.0",\n    "@babel/core": "^7.20.0",\n    "@types/react": "~19.0.10",\n    "typescript": "~5.8.3"\n  },\n  "private": true\n}\n`,
        type: "text",
      },
      "frontend/native/unistyles/theme.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "16b3e0443f",
        },
        content: `const sharedColors = {\n  success: "#22C55E",\n  destructive: "#EF4444",\n  warning: "#F59E0B",\n  info: "#3B82F6",\n} as const;\n\nexport const lightTheme = {\n  colors: {\n    ...sharedColors,\n    typography: "hsl(222.2 84% 4.9%)",\n    background: "hsl(0 0% 100%)",\n    foreground: "hsl(222.2 84% 4.9%)",\n    card: "hsl(0 0% 100%)",\n    cardForeground: "hsl(222.2 84% 4.9%)",\n    primary: "hsl(221.2 83.2% 53.3%)",\n    primaryForeground: "hsl(210 40% 98%)",\n    secondary: "hsl(210 40% 96%)",\n    secondaryForeground: "hsl(222.2 84% 4.9%)",\n    muted: "hsl(210 40% 96%)",\n    mutedForeground: "hsl(215.4 16.3% 46.9%)",\n    accent: "hsl(210 40% 96%)",\n    accentForeground: "hsl(222.2 84% 4.9%)",\n    border: "hsl(214.3 31.8% 91.4%)",\n    input: "hsl(214.3 31.8% 91.4%)",\n    ring: "hsl(221.2 83.2% 53.3%)",\n  },\n  spacing: {\n    xs: 4,\n    sm: 8,\n    md: 16,\n    lg: 24,\n    xl: 32,\n    xxl: 48,\n  },\n  borderRadius: {\n    sm: 6,\n    md: 8,\n    lg: 12,\n    xl: 16,\n  },\n  fontSize: {\n    xs: 12,\n    sm: 14,\n    base: 16,\n    lg: 18,\n    xl: 20,\n    "2xl": 24,\n    "3xl": 30,\n    "4xl": 36,\n  },\n} as const;\n\nexport const darkTheme = {\n  colors: {\n    ...sharedColors,\n    typography: "hsl(210 40% 98%)",\n    background: "hsl(222.2 84% 4.9%)",\n    foreground: "hsl(210 40% 98%)",\n    card: "hsl(222.2 84% 4.9%)",\n    cardForeground: "hsl(210 40% 98%)",\n    primary: "hsl(217.2 91.2% 59.8%)",\n    primaryForeground: "hsl(222.2 84% 4.9%)",\n    secondary: "hsl(217.2 32.6% 17.5%)",\n    secondaryForeground: "hsl(210 40% 98%)",\n    muted: "hsl(217.2 32.6% 17.5%)",\n    mutedForeground: "hsl(215 20.2% 65.1%)",\n    accent: "hsl(217.2 32.6% 17.5%)",\n    accentForeground: "hsl(210 40% 98%)",\n    border: "hsl(217.2 32.6% 17.5%)",\n    input: "hsl(217.2 32.6% 17.5%)",\n    ring: "hsl(224.3 76.3% 94.1%)",\n  },\n  spacing: {\n    xs: 4,\n    sm: 8,\n    md: 16,\n    lg: 24,\n    xl: 32,\n    xxl: 48,\n  },\n  borderRadius: {\n    sm: 6,\n    md: 8,\n    lg: 12,\n    xl: 16,\n  },\n  fontSize: {\n    xs: 12,\n    sm: 14,\n    base: 16,\n    lg: 18,\n    xl: 20,\n    "2xl": 24,\n    "3xl": 30,\n    "4xl": 36,\n  },\n} as const;\n`,
        type: "text",
      },
      "frontend/native/unistyles/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "1577eef722",
        },
        content: `{\n  "extends": "expo/tsconfig.base",\n  "compilerOptions": {\n    "strict": true,\n    "jsx": "react-jsx",\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["*"]\n    }\n  },\n  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],\n  {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n}\n`,
        type: "text",
      },
      "frontend/native/unistyles/unistyles.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3490f01b76",
        },
        content: `import { StyleSheet } from "react-native-unistyles";\n\nimport { breakpoints } from "./breakpoints";\nimport { darkTheme, lightTheme } from "./theme";\n\ntype AppBreakpoints = typeof breakpoints;\n\ntype AppThemes = {\n  light: typeof lightTheme;\n  dark: typeof darkTheme;\n};\n\ndeclare module "react-native-unistyles" {\n  export interface UnistylesBreakpoints extends AppBreakpoints {}\n  export interface UnistylesThemes extends AppThemes {}\n}\n\nStyleSheet.configure({\n  breakpoints,\n  themes: {\n    light: lightTheme,\n    dark: darkTheme,\n  },\n  settings: {\n    adaptiveThemes: true,\n  },\n});\n`,
        type: "text",
      },
      "frontend/native/unistyles/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "41acf91f5a",
        },
        content: `node_modules/\n.expo/\ndist/\nnpm-debug.*\n*.jks\n*.p8\n*.p12\n*.key\n*.mobileprovision\n*.orig.*\nweb-build/\n# expo router\nexpo-env.d.ts\n\n\n\nios\nandroid\n\n# macOS\n.DS_Store\n\n# Temporary files created by Metro to check the health of the file watcher\n.metro-health-check*`,
        type: "text",
      },
      "frontend/nuxt/app/app.config.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "8004b0e904",
        },
        content: `export default defineAppConfig({\n  // https://ui.nuxt.com/getting-started/theme#design-system\n  ui: {\n    colors: {\n      primary: 'emerald',\n      neutral: 'slate',\n    },\n    button: {\n      defaultVariants: {\n        // Set default button color to neutral\n        // color: 'neutral'\n      }\n    }\n  }\n})\n`,
        type: "text",
      },
      "frontend/nuxt/app/app.vue": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "dd7f0a492f",
        },
        content: `<script setup lang="ts">\nimport { VueQueryDevtools } from '@tanstack/vue-query-devtools'\n</script>\n\n<template>\n    <NuxtLoadingIndicator />\n    <UApp>\n        <NuxtLayout>\n            <NuxtPage />\n        </NuxtLayout>\n    </UApp>\n    <VueQueryDevtools />\n</template>\n`,
        type: "text",
      },
      "frontend/nuxt/app/assets/css/main.css": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "2de5d7da58",
        },
        content: `@import "tailwindcss";\n@import "@nuxt/ui";\n`,
        type: "text",
      },
      "frontend/nuxt/app/components/Header.vue.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "9639147791",
        },
        content: `<script setup lang="ts">\nimport { USeparator } from '#components';\nimport ModeToggle from './ModeToggle.vue'\n{{#if auth}}\nimport UserMenu from './UserMenu.vue'\n{{/if}}\n\nconst links = [\n    { to: "/", label: "Home" },\n    {{#if auth}}\n    { to: "/dashboard", label: "Dashboard" },\n    {{/if}}\n    {{#if (includes examples "todo")}}\n    { to: "/todos", label: "Todos" },\n    {{/if}}\n    {{#if (includes examples "ai")}}\n    { to: "/ai", label: "AI Chat" },\n    {{/if}}\n];\n</script>\n\n<template>\n  <div>\n    <div class="flex flex-row items-center justify-between px-2 py-1">\n      <nav class="flex gap-4 text-lg">\n        <NuxtLink\n          v-for="link in links"\n          :key="link.to"\n          :to="link.to"\n          class="text-foreground hover:text-primary"\n          active-class="text-primary font-semibold"\n        >\n          {{ link.label }}\n        </NuxtLink>\n      </nav>\n      <div class="flex items-center gap-2">\n        <ModeToggle />\n        {{#if auth}}\n        <UserMenu />\n        {{/if}}\n      </div>\n    </div>\n    <USeparator />\n  </div>\n</template>\n`,
        type: "text",
      },
      "frontend/nuxt/app/components/Loader.vue": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "acb2dc9c47",
        },
        content: `<template>\n  <div class="flex h-full items-center justify-center pt-8">\n    <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />\n  </div>\n</template>\n`,
        type: "text",
      },
      "frontend/nuxt/app/components/ModeToggle.vue": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "58fa9b7973",
        },
        content: `<script setup lang="ts">\nconst colorMode = useColorMode()\n\nconst isDark = computed({\n  get () {\n    return colorMode.value === 'dark'\n  },\n  set (value) {\n    colorMode.preference = value ? 'dark' : 'light'\n  }\n})\n</script>\n\n<template>\n  <div class="flex items-center">\n    <USwitch\n      v-model="isDark"\n      :checked-icon="isDark ? 'i-lucide-moon' : ''"\n      :unchecked-icon="!isDark ? 'i-lucide-sun' : ''"\n      class="mr-2"\n    />\n  </div>\n</template>\n`,
        type: "text",
      },
      "frontend/nuxt/app/layouts/default.vue.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e4cbc6a9f6",
        },
        content: `<script setup>\n</script>\n\n<template>\n    <div class="grid grid-rows-[auto_1fr] h-full">\n        <Header />\n        <main class="overflow-y-auto">\n            <slot />\n        </main>\n    </div>\n</template>\n`,
        type: "text",
      },
      "frontend/nuxt/app/pages/index.vue.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "a449a1dada",
        },
        content: `<script setup lang="ts">\n{{#unless (eq api "none")}}\nconst { $orpc } = useNuxtApp()\nimport { useQuery } from '@tanstack/vue-query'\n{{/unless}}\n\nconst TITLE_TEXT = \`\n ██████╗ ███████╗████████╗████████╗███████╗██████╗\n ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗\n ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝\n    ██║       ███████╗   ██║   ███████║██║     █████╔╝\n    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗\n    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗\n    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\n \`;\n\n{{#unless (eq api "none")}}\nconst healthCheck = useQuery($orpc.healthCheck.queryOptions())\n{{/unless}}\n</script>\n\n<template>\n  <div class="container mx-auto max-w-3xl px-4 py-2">\n    <pre class="overflow-x-auto font-mono text-sm whitespace-pre-wrap">{{ TITLE_TEXT }}</pre>\n    <div class="grid gap-6 mt-4">\n      {{#unless (eq api "none")}}\n      <section class="rounded-lg border p-4">\n        <h2 class="mb-2 font-medium">API Status</h2>\n        <div class="flex items-center gap-2">\n            <div class="flex items-center gap-2">\n              <div\n                class="w-2 h-2 rounded-full"\n                :class="{\n                  'bg-yellow-500 animate-pulse': healthCheck.status.value === 'pending',\n                  'bg-green-500': healthCheck.status.value === 'success',\n                  'bg-red-500': healthCheck.status.value === 'error',\n                  'bg-gray-400': healthCheck.status.value !== 'pending' &&\n                                  healthCheck.status.value !== 'success' &&\n                                  healthCheck.status.value !== 'error'\n                }"\n              ></div>\n              <span class="text-sm text-muted-foreground">\n                <template v-if="healthCheck.status.value === 'pending'">\n                  Checking...\n                </template>\n                <template v-else-if="healthCheck.status.value === 'success'">\n                  Connected ({{ healthCheck.data.value }})\n                </template>\n                <template v-else-if="healthCheck.status.value === 'error'">\n                  Error: {{ healthCheck.error.value?.message || 'Failed to connect' }}\n                </template>\n                 <template v-else>\n                  Idle\n                </template>\n              </span>\n            </div>\n          </div>\n      </section>\n      {{/unless}}\n    </div>\n  </div>\n</template>\n`,
        type: "text",
      },
      "frontend/nuxt/app/plugins/vue-query.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "846cc42297",
        },
        content: `import type {\n  DehydratedState,\n  VueQueryPluginOptions,\n} from '@tanstack/vue-query'\nimport {\n  dehydrate,\n  hydrate,\n  QueryCache,\n  QueryClient,\n  VueQueryPlugin,\n} from '@tanstack/vue-query'\n\nexport default defineNuxtPlugin((nuxt) => {\n  const vueQueryState = useState<DehydratedState | null>('vue-query')\n\n  const toast = useToast()\n\n  const queryClient = new QueryClient({\n    queryCache: new QueryCache({\n      onError: (error) => {\n        console.log(error)\n        toast.add({\n          title: 'Error',\n          description: error?.message || 'An unexpected error occurred.',\n        })\n      },\n    }),\n  })\n  const options: VueQueryPluginOptions = { queryClient }\n\n  nuxt.vueApp.use(VueQueryPlugin, options)\n\n  if (import.meta.server) {\n    nuxt.hooks.hook('app:rendered', () => {\n      vueQueryState.value = dehydrate(queryClient)\n    })\n  }\n\n  if (import.meta.client) {\n    nuxt.hooks.hook('app:created', () => {\n      hydrate(queryClient, vueQueryState.value)\n    })\n  }\n})\n`,
        type: "text",
      },
      "frontend/nuxt/nuxt.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "2908b4cb5c",
        },
        content: `// https://nuxt.com/docs/api/configuration/nuxt-config\nexport default defineNuxtConfig({\n  compatibilityDate: '2024-11-01',\n  future: {\n    compatibilityVersion: 4\n  },\n  devtools: { enabled: true },\n  modules: ['@nuxt/ui'],\n  css: ['~/assets/css/main.css'],\n  devServer: {\n    port: 3001\n  },\n  ssr: false,\n  runtimeConfig: {\n    public: {\n      serverURL: process.env.NUXT_PUBLIC_SERVER_URL,\n    }\n  }\n})\n`,
        type: "text",
      },
      "frontend/nuxt/package.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3aea9f2dd0",
        },
        content: {
          name: "web",
          private: true,
          type: "module",
          scripts: {
            build: "nuxt build",
            dev: "nuxt dev",
            generate: "nuxt generate",
            preview: "nuxt preview",
            postinstall: "nuxt prepare",
          },
          dependencies: {
            "@nuxt/ui": "3.0.2",
            "@tanstack/vue-query": "^5.74.5",
            nuxt: "^3.16.2",
            typescript: "^5.6.3",
            vue: "^3.5.13",
            "vue-router": "^4.5.0",
            zod: "^3.25.16",
          },
          devDependencies: {
            "@tanstack/vue-query-devtools": "^5.74.5",
            "@iconify-json/lucide": "^1.2.38",
          },
        } satisfies PackageJson,
        type: "json",
      },
      "frontend/nuxt/public/favicon.ico": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "9fc7a0c84f",
        },
        content: "",
        type: "binary",
        binaryHash: "9fc7a0c84f",
      },
      "frontend/nuxt/public/robots.txt": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "8fc388b0bf",
        },
        content: `User-Agent: *\nDisallow:\n`,
        type: "text",
      },
      "frontend/nuxt/server/tsconfig.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e04d93e870",
        },
        content: {
          extends: "../.nuxt/tsconfig.server.json",
        } satisfies TSConfig,
        type: "json",
      },
      "frontend/nuxt/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b02ead3ba4",
        },
        content: `{\n  // https://nuxt.com/docs/guide/concepts/typescript\n  "extends": "./.nuxt/tsconfig.json",\n  {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n}\n`,
        type: "text",
      },
      "frontend/nuxt/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "9f7e7176ba",
        },
        content: `# Nuxt dev/build outputs\n.output\n.data\n.nuxt\n.nitro\n.cache\ndist\n\n# Node dependencies\nnode_modules\n\n# Logs\nlogs\n*.log\n\n# Misc\n.DS_Store\n.fleet\n.idea\n\n# Local env files\n.env\n.env.*\n!.env.example\n`,
        type: "text",
      },
      "frontend/react/next/next-env.d.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "f75a118439",
        },
        content: `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n`,
        type: "text",
      },
      "frontend/react/next/next.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b3e1d93fd2",
        },
        content: `import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;\n`,
        type: "text",
      },
      "frontend/react/next/package.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "0b983267f5",
        },
        content: `{\n  "name": "web",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev --turbopack --port=3001",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "radix-ui": "^1.4.2",\n    "@tanstack/react-form": "^1.3.2",\n    "class-variance-authority": "^0.7.1",\n    "clsx": "^2.1.1",\n    "lucide-react": "^0.487.0",\n    "next": "15.3.0",\n    "next-themes": "^0.4.6",\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "sonner": "^2.0.3",\n    "tailwind-merge": "^3.2.0",\n    "tw-animate-css": "^1.2.5",\n    "zod": "^3.25.16"\n  },\n  "devDependencies": {\n    "@tailwindcss/postcss": "^4",\n    "@types/node": "^20",\n    "@types/react": "^19",\n    "@types/react-dom": "^19",\n    "tailwindcss": "^4",\n    "typescript": "^5"\n  }\n}\n`,
        type: "text",
      },
      "frontend/react/next/postcss.config.mjs.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "73695b153f",
        },
        content: `const config = {\n  plugins: ["@tailwindcss/postcss"],\n};\n\nexport default config;\n`,
        type: "text",
      },
      "frontend/react/next/src/app/favicon.ico": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "9ecfcc8f0e",
        },
        content: "",
        type: "binary",
        binaryHash: "9ecfcc8f0e",
      },
      "frontend/react/next/src/app/layout.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "2b199051ab",
        },
        content: `import type { Metadata } from "next";\nimport { Geist, Geist_Mono } from "next/font/google";\nimport "../index.css";\nimport Providers from "@/components/providers";\nimport Header from "@/components/header";\n\nconst geistSans = Geist({\n  variable: "--font-geist-sans",\n  subsets: ["latin"],\n});\n\nconst geistMono = Geist_Mono({\n  variable: "--font-geist-mono",\n  subsets: ["latin"],\n});\n\nexport const metadata: Metadata = {\n  title: "{{projectName}}",\n  description: "{{projectName}}",\n};\n\nexport default function RootLayout({\n  children,\n}: Readonly<{\n  children: React.ReactNode;\n}>) {\n  return (\n    <html lang="en" suppressHydrationWarning>\n      <body\n        className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}\n      >\n        <Providers>\n          <div className="grid grid-rows-[auto_1fr] h-svh">\n            <Header />\n            {children}\n          </div>\n        </Providers>\n      </body>\n    </html>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/next/src/app/page.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "78e7e7eea2",
        },
        content: `"use client"\n{{#if (eq backend "convex")}}\nimport { useQuery } from "convex/react";\nimport { api } from "@{{projectName}}/backend/convex/_generated/api";\n{{else if (or (eq api "orpc") (eq api "trpc"))}}\nimport { useQuery } from "@tanstack/react-query";\n  {{#if (eq api "orpc")}}\nimport { orpc } from "@/utils/orpc";\n  {{/if}}\n  {{#if (eq api "trpc")}}\nimport { trpc } from "@/utils/trpc";\n  {{/if}}\n{{/if}}\n\nconst TITLE_TEXT = \`\n ██████╗ ███████╗████████╗████████╗███████╗██████╗\n ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗\n ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝\n    ██║       ███████╗   ██║   ███████║██║     █████╔╝\n    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗\n    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗\n    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\n \`;\n\nexport default function Home() {\n  {{#if (eq backend "convex")}}\n  const healthCheck = useQuery(api.healthCheck.get);\n  {{else if (eq api "orpc")}}\n  const healthCheck = useQuery(orpc.healthCheck.queryOptions());\n  {{else if (eq api "trpc")}}\n  const healthCheck = useQuery(trpc.healthCheck.queryOptions());\n  {{/if}}\n\n  return (\n    <div className="container mx-auto max-w-3xl px-4 py-2">\n      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>\n      <div className="grid gap-6">\n        <section className="rounded-lg border p-4">\n          <h2 className="mb-2 font-medium">API Status</h2>\n          {{#if (eq backend "convex")}}\n          <div className="flex items-center gap-2">\n            <div\n              className={\`h-2 w-2 rounded-full \${healthCheck === "OK" ? "bg-green-500" : healthCheck === undefined ? "bg-orange-400" : "bg-red-500"}\`}\n            />\n            <span className="text-sm text-muted-foreground">\n              {healthCheck === undefined\n                ? "Checking..."\n                : healthCheck === "OK"\n                  ? "Connected"\n                  : "Error"}\n            </span>\n          </div>\n          {{else}}\n            {{#unless (eq api "none")}}\n            <div className="flex items-center gap-2">\n              <div\n                className={\`h-2 w-2 rounded-full \${healthCheck.data ? "bg-green-500" : "bg-red-500"}\`}\n              />\n              <span className="text-sm text-muted-foreground">\n                {healthCheck.isLoading\n                  ? "Checking..."\n                  : healthCheck.data\n                    ? "Connected"\n                    : "Disconnected"}\n              </span>\n            </div>\n            {{/unless}}\n          {{/if}}\n        </section>\n      </div>\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/next/src/components/mode-toggle.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "caf9fcffbf",
        },
        content: `"use client"\n\nimport * as React from "react"\nimport { Moon, Sun } from "lucide-react"\nimport { useTheme } from "next-themes"\nimport { Button } from "@/components/ui/button"\nimport {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuTrigger,\n} from "@/components/ui/dropdown-menu"\n\nexport function ModeToggle() {\n  const { setTheme } = useTheme()\n\n  return (\n    <DropdownMenu>\n      <DropdownMenuTrigger asChild>\n        <Button variant="outline" size="icon">\n          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />\n          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />\n          <span className="sr-only">Toggle theme</span>\n        </Button>\n      </DropdownMenuTrigger>\n      <DropdownMenuContent align="end">\n        <DropdownMenuItem onClick={() => setTheme("light")}>\n          Light\n        </DropdownMenuItem>\n        <DropdownMenuItem onClick={() => setTheme("dark")}>\n          Dark\n        </DropdownMenuItem>\n        <DropdownMenuItem onClick={() => setTheme("system")}>\n          System\n        </DropdownMenuItem>\n      </DropdownMenuContent>\n    </DropdownMenu>\n  )\n}\n`,
        type: "text",
      },
      "frontend/react/next/src/components/providers.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "431e08d7f0",
        },
        content: `"use client";\n\n{{#if (eq backend "convex")}}\nimport { ConvexProvider, ConvexReactClient } from "convex/react";\n{{else}}\n{{#unless (eq api "none")}}\nimport { QueryClientProvider } from "@tanstack/react-query";\nimport { ReactQueryDevtools } from "@tanstack/react-query-devtools";\n{{#if (eq api "orpc")}}\nimport { queryClient } from "@/utils/orpc";\n{{/if}}\n{{#if (eq api "trpc")}}\nimport { queryClient } from "@/utils/trpc";\n{{/if}}\n{{/unless}}\n{{/if}}\nimport { ThemeProvider } from "./theme-provider";\nimport { Toaster } from "./ui/sonner";\n\n{{#if (eq backend "convex")}}\nconst convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);\n{{/if}}\n\nexport default function Providers({\n  children\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <ThemeProvider\n      attribute="class"\n      defaultTheme="system"\n      enableSystem\n      disableTransitionOnChange\n    >\n      {{#if (eq backend "convex")}}\n      <ConvexProvider client={convex}>{children}</ConvexProvider>\n      {{else}}\n      {{#unless (eq api "none")}}\n      <QueryClientProvider client={queryClient}>\n        {{#if (eq api "orpc")}}\n        {children}\n        {{/if}}\n        {{#if (eq api "trpc")}}\n        {children}\n        {{/if}}\n        <ReactQueryDevtools />\n      </QueryClientProvider>\n      {{else}}\n      {children}\n      {{/unless}}\n      {{/if}}\n      <Toaster richColors />\n    </ThemeProvider>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/next/src/components/theme-provider.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "454fd475e0",
        },
        content: `"use client"\n\nimport * as React from "react"\nimport { ThemeProvider as NextThemesProvider } from "next-themes"\n\nexport function ThemeProvider({\n  children,\n  ...props\n}: React.ComponentProps<typeof NextThemesProvider>) {\n  return <NextThemesProvider {...props}>{children}</NextThemesProvider>\n}\n`,
        type: "text",
      },
      "frontend/react/next/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "71d72ee25a",
        },
        content: `{\n  "compilerOptions": {\n    "target": "ES2017",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "verbatimModuleSyntax": true,\n    "jsx": "preserve",\n    "incremental": true,\n    "plugins": [\n      {\n        "name": "next"\n      }\n    ],\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  },\n  "include": ["./next-env.d.ts", "./**/*.ts", "./**/*.tsx", "./.next/types/**/*.ts"],\n  "exclude": ["./node_modules"],\n  {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n}\n`,
        type: "text",
      },
      "frontend/react/react-router/package.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "882664403c",
        },
        content: {
          name: "web",
          private: true,
          type: "module",
          scripts: {
            build: "react-router build",
            dev: "react-router dev",
            start: "react-router-serve ./build/server/index.js",
            typecheck: "react-router typegen && tsc",
          },
          dependencies: {
            "radix-ui": "^1.4.2",
            "@react-router/fs-routes": "^7.6.1",
            "@react-router/node": "^7.6.1",
            "@react-router/serve": "^7.6.1",
            "@tanstack/react-form": "^1.12.0",
            "class-variance-authority": "^0.7.1",
            clsx: "^2.1.1",
            isbot: "^5.1.28",
            "lucide-react": "^0.511.0",
            "next-themes": "^0.4.6",
            react: "19.0.0",
            "react-dom": "19.0.0",
            "react-router": "^7.6.1",
            sonner: "^2.0.3",
            "tailwind-merge": "^3.3.0",
            "tw-animate-css": "^1.3.2",
            zod: "^3.25.42",
          },
          devDependencies: {
            "@react-router/dev": "^7.6.1",
            "@tailwindcss/vite": "^4.1.8",
            "@types/node": "^20",
            "@types/react": "^19.0.12",
            "@types/react-dom": "^19.0.4",
            "react-router-devtools": "^1.1.0",
            tailwindcss: "^4.1.8",
            typescript: "^5.8.3",
            vite: "^6.3.5",
            "vite-tsconfig-paths": "^5.1.4",
          },
        } satisfies PackageJson,
        type: "json",
      },
      "frontend/react/react-router/public/favicon.ico": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "6eda863d14",
        },
        content: "",
        type: "binary",
        binaryHash: "6eda863d14",
      },
      "frontend/react/react-router/react-router.config.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "690c008545",
        },
        content: `import type { Config } from "@react-router/dev/config";\n\nexport default {\n  ssr: false,\n  appDirectory: "src",\n} satisfies Config;\n`,
        type: "text",
      },
      "frontend/react/react-router/src/components/mode-toggle.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b14bf362dd",
        },
        content: `import { Moon, Sun } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\nimport {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuTrigger,\n} from "@/components/ui/dropdown-menu";\nimport { useTheme } from "@/components/theme-provider";\n\nexport function ModeToggle() {\n  const { setTheme } = useTheme();\n\n  return (\n    <DropdownMenu>\n      <DropdownMenuTrigger asChild>\n        <Button variant="outline" size="icon">\n          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />\n          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />\n          <span className="sr-only">Toggle theme</span>\n        </Button>\n      </DropdownMenuTrigger>\n      <DropdownMenuContent align="end">\n        <DropdownMenuItem onClick={() => setTheme("light")}>\n          Light\n        </DropdownMenuItem>\n        <DropdownMenuItem onClick={() => setTheme("dark")}>\n          Dark\n        </DropdownMenuItem>\n        <DropdownMenuItem onClick={() => setTheme("system")}>\n          System\n        </DropdownMenuItem>\n      </DropdownMenuContent>\n    </DropdownMenu>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/react-router/src/components/theme-provider.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b5d60fac38",
        },
        content: `import { createContext, useContext, useEffect, useState } from "react";\n\ntype Theme = "dark" | "light" | "system";\n\ntype ThemeProviderProps = {\n  children: React.ReactNode;\n  defaultTheme?: Theme;\n  storageKey?: string;\n};\n\ntype ThemeProviderState = {\n  theme: Theme;\n  setTheme: (theme: Theme) => void;\n};\n\nconst initialState: ThemeProviderState = {\n  theme: "system",\n  setTheme: () => null,\n};\n\nconst ThemeProviderContext = createContext<ThemeProviderState>(initialState);\n\nexport function ThemeProvider({\n  children,\n  defaultTheme = "system",\n  storageKey = "vite-ui-theme",\n  ...props\n}: ThemeProviderProps) {\n  const [theme, setTheme] = useState<Theme>(\n    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme\n  );\n\n  useEffect(() => {\n    const root = window.document.documentElement;\n\n    root.classList.remove("light", "dark");\n\n    if (theme === "system") {\n      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")\n        .matches\n        ? "dark"\n        : "light";\n\n      root.classList.add(systemTheme);\n      return;\n    }\n\n    root.classList.add(theme);\n  }, [theme]);\n\n  const value = {\n    theme,\n    setTheme: (theme: Theme) => {\n      localStorage.setItem(storageKey, theme);\n      setTheme(theme);\n    },\n  };\n\n  return (\n    <ThemeProviderContext.Provider {...props} value={value}>\n      {children}\n    </ThemeProviderContext.Provider>\n  );\n}\n\nexport const useTheme = () => {\n  const context = useContext(ThemeProviderContext);\n\n  if (context === undefined)\n    throw new Error("useTheme must be used within a ThemeProvider");\n\n  return context;\n};\n`,
        type: "text",
      },
      "frontend/react/react-router/src/root.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "188ca083f5",
        },
        content: `import {\n  isRouteErrorResponse,\n  Links,\n  Meta,\n  Outlet,\n  Scripts,\n  ScrollRestoration,\n} from "react-router";\nimport type { Route } from "./+types/root";\nimport "./index.css";\nimport Header from "./components/header";\nimport { ThemeProvider } from "./components/theme-provider";\nimport { Toaster } from "./components/ui/sonner";\n\n{{#if (eq backend "convex")}}\nimport { ConvexProvider, ConvexReactClient } from "convex/react";\n{{else}}\n{{#unless (eq api "none")}}\nimport { QueryClientProvider } from "@tanstack/react-query";\nimport { ReactQueryDevtools } from "@tanstack/react-query-devtools";\n{{#if (eq api "orpc")}}\nimport { queryClient } from "./utils/orpc";\n{{/if}}\n{{#if (eq api "trpc")}}\nimport { queryClient } from "./utils/trpc";\n{{/if}}\n{{/unless}}\n{{/if}}\n\nexport const links: Route.LinksFunction = () => [\n  {\n    rel: "preconnect",\n    href: "https://fonts.googleapis.com",\n  },\n  {\n    rel: "preconnect",\n    href: "https://fonts.gstatic.com",\n    crossOrigin: "anonymous",\n  },\n  {\n    rel: "stylesheet",\n    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",\n  },\n];\n\nexport function Layout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <head>\n        <meta charSet="utf-8" />\n        <meta name="viewport" content="width=device-width, initial-scale=1" />\n        <Meta />\n        <Links />\n      </head>\n      <body>\n        {children}\n        <ScrollRestoration />\n        <Scripts />\n      </body>\n    </html>\n  );\n}\n\n{{#if (eq backend "convex")}}\nexport default function App() {\n  const convex = new ConvexReactClient(\n    import.meta.env.VITE_CONVEX_URL as string,\n  );\n  return (\n    <ConvexProvider client={convex}>\n      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">\n        <div className="grid grid-rows-[auto_1fr] h-svh">\n          <Header />\n          <Outlet />\n        </div>\n        <Toaster richColors />\n      </ThemeProvider>\n    </ConvexProvider>\n  );\n}\n{{else if (eq api "orpc")}}\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">\n          <div className="grid grid-rows-[auto_1fr] h-svh">\n            <Header />\n            <Outlet />\n          </div>\n          <Toaster richColors />\n        </ThemeProvider>\n      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />\n    </QueryClientProvider>\n  );\n}\n{{else if (eq api "trpc")}}\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">\n        <div className="grid grid-rows-[auto_1fr] h-svh">\n          <Header />\n          <Outlet />\n        </div>\n        <Toaster richColors />\n      </ThemeProvider>\n      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />\n    </QueryClientProvider>\n  );\n}\n{{else}}\nexport default function App() {\n  return (\n    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">\n      <div className="grid grid-rows-[auto_1fr] h-svh">\n        <Header />\n        <Outlet />\n      </div>\n      <Toaster richColors />\n    </ThemeProvider>\n  );\n}\n{{/if}}\n\nexport function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {\n  let message = "Oops!";\n  let details = "An unexpected error occurred.";\n  let stack: string | undefined;\n\n  if (isRouteErrorResponse(error)) {\n    message = error.status === 404 ? "404" : "Error";\n    details =\n      error.status === 404\n        ? "The requested page could not be found."\n        : error.statusText || details;\n  } else if (import.meta.env.DEV && error && error instanceof Error) {\n    details = error.message;\n    stack = error.stack;\n  }\n\n  return (\n    <main className="pt-16 p-4 container mx-auto">\n      <h1>{message}</h1>\n      <p>{details}</p>\n      {stack && (\n        <pre className="w-full p-4 overflow-x-auto">\n          <code>{stack}</code>\n        </pre>\n      )}\n    </main>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/react-router/src/routes/_index.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "983b839034",
        },
        content: `import type { Route } from "./+types/_index";\n{{#if (eq backend "convex")}}\nimport { useQuery } from "convex/react";\nimport { api } from "@{{projectName}}/backend/convex/_generated/api";\n{{else if (or (eq api "orpc") (eq api "trpc"))}}\nimport { useQuery } from "@tanstack/react-query";\n  {{#if (eq api "orpc")}}\n  import { orpc } from "@/utils/orpc";\n  {{/if}}\n  {{#if (eq api "trpc")}}\n  import { trpc } from "@/utils/trpc";\n  {{/if}}\n{{/if}}\n\nconst TITLE_TEXT = \`\n ██████╗ ███████╗████████╗████████╗███████╗██████╗\n ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗\n ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝\n    ██║       ███████╗   ██║   ███████║██║     █████╔╝\n    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗\n    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗\n    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\n \`;\n\nexport function meta({}: Route.MetaArgs) {\n  return [{ title: "My App" }, { name: "description", content: "My App" }];\n}\n\nexport default function Home() {\n  {{#if (eq backend "convex")}}\n  const healthCheck = useQuery(api.healthCheck.get);\n  {{else if (eq api "orpc")}}\n  const healthCheck = useQuery(orpc.healthCheck.queryOptions());\n  {{else if (eq api "trpc")}}\n  const healthCheck = useQuery(trpc.healthCheck.queryOptions());\n  {{/if}}\n\n  return (\n    <div className="container mx-auto max-w-3xl px-4 py-2">\n      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>\n      <div className="grid gap-6">\n        <section className="rounded-lg border p-4">\n          <h2 className="mb-2 font-medium">API Status</h2>\n          {{#if (eq backend "convex")}}\n          <div className="flex items-center gap-2">\n            <div\n              className={\`h-2 w-2 rounded-full \${healthCheck === "OK" ? "bg-green-500" : healthCheck === undefined ? "bg-orange-400" : "bg-red-500"}\`}\n            />\n            <span className="text-sm text-muted-foreground">\n              {healthCheck === undefined\n                ? "Checking..."\n                : healthCheck === "OK"\n                  ? "Connected"\n                  : "Error"}\n            </span>\n          </div>\n          {{else}}\n            {{#unless (eq api "none")}}\n            <div className="flex items-center gap-2">\n              <div\n                className={\`h-2 w-2 rounded-full \${\n                  healthCheck.data ? "bg-green-500" : "bg-red-500"\n                }\`}\n              />\n              <span className="text-sm text-muted-foreground">\n                {healthCheck.isLoading\n                  ? "Checking..."\n                  : healthCheck.data\n                  ? "Connected"\n                  : "Disconnected"}\n              </span>\n            </div>\n            {{/unless}}\n          {{/if}}\n        </section>\n      </div>\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/react-router/src/routes.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "7269090574",
        },
        content: `import { type RouteConfig } from "@react-router/dev/routes";\nimport { flatRoutes } from "@react-router/fs-routes";\n\nexport default flatRoutes() satisfies RouteConfig;\n`,
        type: "text",
      },
      "frontend/react/react-router/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "5aef6e7cb8",
        },
        content: `{\n  "include": [\n    "**/*",\n    "**/.server/**/*",\n    "**/.client/**/*",\n    ".react-router/types/**/*"\n  ],\n  "compilerOptions": {\n    "lib": ["DOM", "DOM.Iterable", "ES2022"],\n    "types": ["node", "vite/client"],\n    "target": "ES2022",\n    "module": "ES2022",\n    "moduleResolution": "bundler",\n    "jsx": "react-jsx",\n    "rootDirs": [".", "./.react-router/types"],\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    },\n    "esModuleInterop": true,\n    "verbatimModuleSyntax": true,\n    "noEmit": true,\n    "resolveJsonModule": true,\n    "skipLibCheck": true,\n    "strict": true\n  },\n  {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n}\n`,
        type: "text",
      },
      "frontend/react/react-router/vite.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d91c4e9491",
        },
        content: `{{#if (includes addons "pwa")}}\nimport { VitePWA } from "vite-plugin-pwa";\n{{/if}}\nimport { reactRouter } from "@react-router/dev/vite";\nimport tailwindcss from "@tailwindcss/vite";\nimport { defineConfig } from "vite";\nimport tsconfigPaths from "vite-tsconfig-paths";\n\nexport default defineConfig({\n  plugins: [\n    tailwindcss(),\n    reactRouter(),\n    tsconfigPaths(),\n    {{#if (includes addons "pwa")}}\n    VitePWA({\n      registerType: "autoUpdate",\n      manifest: {\n        name: "{{projectName}}",\n        short_name: "{{projectName}}",\n        description: "{{projectName}} - PWA Application",\n        theme_color: "#0c0c0c",\n      },\n      pwaAssets: {\n        disabled: false,\n        config: true,\n      },\n      devOptions: {\n        enabled: true,\n      },\n    }),\n    {{/if}}\n  ],\n});\n`,
        type: "text",
      },
      "frontend/react/tanstack-router/index.html": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "a08b62ee0f",
        },
        content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  </head>\n\n  <body>\n    <div id="app"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`,
        type: "text",
      },
      "frontend/react/tanstack-router/package.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "55ff58c2f3",
        },
        content: {
          name: "web",
          version: "0.0.0",
          private: true,
          type: "module",
          scripts: {
            dev: "vite --port=3001",
            build: "vite build",
            serve: "vite preview",
            start: "vite",
            "check-types": "tsc --noEmit",
          },
          devDependencies: {
            "@tanstack/react-router-devtools": "^1.114.27",
            "@tanstack/router-plugin": "^1.114.27",
            "@types/node": "^22.13.13",
            "@types/react": "^19.0.12",
            "@types/react-dom": "^19.0.4",
            "@vitejs/plugin-react": "^4.3.4",
            postcss: "^8.5.3",
            tailwindcss: "^4.0.15",
            vite: "^6.2.2",
          },
          dependencies: {
            "@hookform/resolvers": "^3.10.0",
            "radix-ui": "^1.4.2",
            "@tanstack/react-form": "^1.0.5",
            "@tailwindcss/vite": "^4.0.15",
            "@tanstack/react-router": "^1.114.25",
            "class-variance-authority": "^0.7.1",
            clsx: "^2.1.1",
            "lucide-react": "^0.473.0",
            "next-themes": "^0.4.6",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
            sonner: "^1.7.4",
            "tailwind-merge": "^2.6.0",
            "tw-animate-css": "^1.2.5",
            zod: "^3.25.16",
          },
        } satisfies PackageJson,
        type: "json",
      },
      "frontend/react/tanstack-router/src/components/mode-toggle.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b14bf362dd",
        },
        content: `import { Moon, Sun } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\nimport {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuTrigger,\n} from "@/components/ui/dropdown-menu";\nimport { useTheme } from "@/components/theme-provider";\n\nexport function ModeToggle() {\n  const { setTheme } = useTheme();\n\n  return (\n    <DropdownMenu>\n      <DropdownMenuTrigger asChild>\n        <Button variant="outline" size="icon">\n          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />\n          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />\n          <span className="sr-only">Toggle theme</span>\n        </Button>\n      </DropdownMenuTrigger>\n      <DropdownMenuContent align="end">\n        <DropdownMenuItem onClick={() => setTheme("light")}>\n          Light\n        </DropdownMenuItem>\n        <DropdownMenuItem onClick={() => setTheme("dark")}>\n          Dark\n        </DropdownMenuItem>\n        <DropdownMenuItem onClick={() => setTheme("system")}>\n          System\n        </DropdownMenuItem>\n      </DropdownMenuContent>\n    </DropdownMenu>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-router/src/components/theme-provider.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b5d60fac38",
        },
        content: `import { createContext, useContext, useEffect, useState } from "react";\n\ntype Theme = "dark" | "light" | "system";\n\ntype ThemeProviderProps = {\n  children: React.ReactNode;\n  defaultTheme?: Theme;\n  storageKey?: string;\n};\n\ntype ThemeProviderState = {\n  theme: Theme;\n  setTheme: (theme: Theme) => void;\n};\n\nconst initialState: ThemeProviderState = {\n  theme: "system",\n  setTheme: () => null,\n};\n\nconst ThemeProviderContext = createContext<ThemeProviderState>(initialState);\n\nexport function ThemeProvider({\n  children,\n  defaultTheme = "system",\n  storageKey = "vite-ui-theme",\n  ...props\n}: ThemeProviderProps) {\n  const [theme, setTheme] = useState<Theme>(\n    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme\n  );\n\n  useEffect(() => {\n    const root = window.document.documentElement;\n\n    root.classList.remove("light", "dark");\n\n    if (theme === "system") {\n      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")\n        .matches\n        ? "dark"\n        : "light";\n\n      root.classList.add(systemTheme);\n      return;\n    }\n\n    root.classList.add(theme);\n  }, [theme]);\n\n  const value = {\n    theme,\n    setTheme: (theme: Theme) => {\n      localStorage.setItem(storageKey, theme);\n      setTheme(theme);\n    },\n  };\n\n  return (\n    <ThemeProviderContext.Provider {...props} value={value}>\n      {children}\n    </ThemeProviderContext.Provider>\n  );\n}\n\nexport const useTheme = () => {\n  const context = useContext(ThemeProviderContext);\n\n  if (context === undefined)\n    throw new Error("useTheme must be used within a ThemeProvider");\n\n  return context;\n};\n`,
        type: "text",
      },
      "frontend/react/tanstack-router/src/main.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e0b49c722c",
        },
        content: `import { RouterProvider, createRouter } from "@tanstack/react-router";\nimport ReactDOM from "react-dom/client";\nimport Loader from "./components/loader";\nimport { routeTree } from "./routeTree.gen";\n\n{{#if (eq api "orpc")}}\n  import { QueryClientProvider } from "@tanstack/react-query";\n  import { orpc, queryClient } from "./utils/orpc";\n{{/if}}\n{{#if (eq api "trpc")}}\n  import { QueryClientProvider } from "@tanstack/react-query";\n  import { queryClient, trpc } from "./utils/trpc";\n{{/if}}\n{{#if (eq backend "convex")}}\n  import { ConvexProvider, ConvexReactClient } from "convex/react";\n  const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);\n{{/if}}\n\nconst router = createRouter({\n  routeTree,\n  defaultPreload: "intent",\n  defaultPendingComponent: () => <Loader />,\n  {{#if (eq api "orpc")}}\n  context: { orpc, queryClient },\n  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {\n    return (\n      <QueryClientProvider client={queryClient}>\n        {children}\n      </QueryClientProvider>\n    );\n  },\n  {{else if (eq api "trpc")}}\n  context: { trpc, queryClient },\n  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {\n    return (\n      <QueryClientProvider client={queryClient}>\n        {children}\n      </QueryClientProvider>\n    );\n  },\n  {{else if (eq backend "convex")}}\n  context: {},\n  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {\n    return <ConvexProvider client={convex}>{children}</ConvexProvider>;\n  },\n  {{else}}\n  context: {},\n  {{/if}}\n});\n\ndeclare module "@tanstack/react-router" {\n  interface Register {\n    router: typeof router;\n  }\n}\n\nconst rootElement = document.getElementById("app");\n\nif (!rootElement) {\n  throw new Error("Root element not found");\n}\n\nif (!rootElement.innerHTML) {\n  const root = ReactDOM.createRoot(rootElement);\n  root.render(<RouterProvider router={router} />);\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-router/src/routes/index.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "cfdec90c2e",
        },
        content: `import { createFileRoute } from "@tanstack/react-router";\n{{#if (eq api "orpc")}}\nimport { orpc } from "@/utils/orpc";\nimport { useQuery } from "@tanstack/react-query";\n{{/if}}\n{{#if (eq api "trpc")}}\nimport { trpc } from "@/utils/trpc";\nimport { useQuery } from "@tanstack/react-query";\n{{/if}}\n{{#if (eq backend "convex")}}\nimport { useQuery } from "convex/react";\nimport { api } from "@{{ projectName }}/backend/convex/_generated/api";\n{{/if}}\n\nexport const Route = createFileRoute("/")({\n  component: HomeComponent,\n});\n\nconst TITLE_TEXT = \`\n ██████╗ ███████╗████████╗████████╗███████╗██████╗\n ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗\n ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝\n    ██║       ███████╗   ██║   ███████║██║     █████╔╝\n    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗\n    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗\n    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\n \`;\n\nfunction HomeComponent() {\n  {{#if (eq api "orpc")}}\n  const healthCheck = useQuery(orpc.healthCheck.queryOptions());\n  {{/if}}\n  {{#if (eq api "trpc")}}\n  const healthCheck = useQuery(trpc.healthCheck.queryOptions());\n  {{/if}}\n  {{#if (eq backend "convex")}}\n  const healthCheck = useQuery(api.healthCheck.get);\n  {{/if}}\n\n  return (\n    <div className="container mx-auto max-w-3xl px-4 py-2">\n      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>\n      <div className="grid gap-6">\n        <section className="rounded-lg border p-4">\n          <h2 className="mb-2 font-medium">API Status</h2>\n          {{#if (eq backend "convex")}}\n          <div className="flex items-center gap-2">\n            <div\n              className={\`h-2 w-2 rounded-full \${healthCheck === "OK" ? "bg-green-500" : healthCheck === undefined ? "bg-orange-400" : "bg-red-500"}\`}\n            />\n            <span className="text-sm text-muted-foreground">\n              {healthCheck === undefined\n                ? "Checking..."\n                : healthCheck === "OK"\n                  ? "Connected"\n                  : "Error"}\n            </span>\n          </div>\n          {{else}}\n            {{#unless (eq api "none")}}\n            <div className="flex items-center gap-2">\n              <div\n                className={\`h-2 w-2 rounded-full \${healthCheck.data ? "bg-green-500" : "bg-red-500"}\`}\n              />\n              <span className="text-sm text-muted-foreground">\n                {healthCheck.isLoading\n                  ? "Checking..."\n                  : healthCheck.data\n                    ? "Connected"\n                    : "Disconnected"}\n              </span>\n            </div>\n            {{/unless}}\n          {{/if}}\n        </section>\n      </div>\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-router/src/routes/__root.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "bd0959ebbb",
        },
        content: `import Header from "@/components/header";\nimport Loader from "@/components/loader";\nimport { ThemeProvider } from "@/components/theme-provider";\nimport { Toaster } from "@/components/ui/sonner";\n{{#if (eq api "orpc")}}\nimport { link, orpc } from "@/utils/orpc";\nimport type { QueryClient } from "@tanstack/react-query";\nimport { ReactQueryDevtools } from "@tanstack/react-query-devtools";\nimport { useState } from "react";\nimport type { RouterClient } from "@orpc/server";\nimport { createTanstackQueryUtils } from "@orpc/tanstack-query";\nimport type { appRouter } from "../../../server/src/routers";\nimport { createORPCClient } from "@orpc/client";\n{{/if}}\n{{#if (eq api "trpc")}}\nimport type { trpc } from "@/utils/trpc";\nimport type { QueryClient } from "@tanstack/react-query";\nimport { ReactQueryDevtools } from "@tanstack/react-query-devtools";\n{{/if}}\nimport {\n  HeadContent,\n  Outlet,\n  createRootRouteWithContext,\n  useRouterState,\n} from "@tanstack/react-router";\nimport { TanStackRouterDevtools } from "@tanstack/react-router-devtools";\nimport "../index.css";\n\n{{#if (eq api "orpc")}}\nexport interface RouterAppContext {\n  orpc: typeof orpc;\n  queryClient: QueryClient;\n}\n{{else if (eq api "trpc")}}\nexport interface RouterAppContext {\n  trpc: typeof trpc;\n  queryClient: QueryClient;\n}\n{{else}}\nexport interface RouterAppContext {}\n{{/if}}\n\nexport const Route = createRootRouteWithContext<RouterAppContext>()({\n  component: RootComponent,\n  head: () => ({\n    meta: [\n      {\n        title: "My App",\n      },\n      {\n        name: "description",\n        content: "My App is a web application",\n      },\n    ],\n    links: [\n      {\n        rel: "icon",\n        href: "/favicon.ico",\n      },\n    ],\n  }),\n});\n\nfunction RootComponent() {\n  const isFetching = useRouterState({\n    select: (s) => s.isLoading,\n  });\n\n  {{#if (eq api "orpc")}}\n  const [client] = useState<RouterClient<typeof appRouter>>(() => createORPCClient(link));\n  const [orpcUtils] = useState(() => createTanstackQueryUtils(client));\n  {{/if}}\n\n  return (\n    <>\n      <HeadContent />\n      {{#if (eq api "orpc")}}\n        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">\n          <div className="grid grid-rows-[auto_1fr] h-svh">\n            <Header />\n            {isFetching ? <Loader /> : <Outlet />}\n          </div>\n          <Toaster richColors />\n        </ThemeProvider>\n      {{else}}\n      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">\n        <div className="grid grid-rows-[auto_1fr] h-svh">\n          <Header />\n          {isFetching ? <Loader /> : <Outlet />}\n        </div>\n        <Toaster richColors />\n      </ThemeProvider>\n      {{/if}}\n      <TanStackRouterDevtools position="bottom-left" />\n      {{#if (or (eq api "orpc") (eq api "trpc"))}}\n      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />\n      {{/if}}\n    </>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-router/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "576d5169ca",
        },
        content: `{\n  "compilerOptions": {\n    "strict": true,\n    "esModuleInterop": true,\n    "jsx": "react-jsx",\n    "target": "ESNext",\n    "module": "ESNext",\n    "moduleResolution": "Bundler",\n    "verbatimModuleSyntax": true,\n    "skipLibCheck": true,\n    "types": ["vite/client"],\n    "rootDirs": ["."],\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  },\n  {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-router/vite.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "5a35ce0c0c",
        },
        content: `{{#if (includes addons "pwa")}}\nimport { VitePWA } from "vite-plugin-pwa";\n{{/if}}\nimport tailwindcss from "@tailwindcss/vite";\nimport { TanStackRouterVite } from "@tanstack/router-plugin/vite";\nimport react from "@vitejs/plugin-react";\nimport path from "node:path";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({\n  plugins: [\n    tailwindcss(),\n    TanStackRouterVite({}),\n    react(),\n    {{#if (includes addons "pwa")}}\n    VitePWA({\n      registerType: "autoUpdate",\n      manifest: {\n        name: "{{projectName}}",\n        short_name: "{{projectName}}",\n        description: "{{projectName}} - PWA Application",\n        theme_color: "#0c0c0c",\n      },\n      pwaAssets: {\n        disabled: false,\n        config: true,\n      },\n      devOptions: {\n        enabled: true,\n      },\n    }),\n    {{/if}}\n  ],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },\n});\n`,
        type: "text",
      },
      "frontend/react/tanstack-start/package.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "fd448475d8",
        },
        content: {
          name: "web",
          private: true,
          type: "module",
          scripts: {
            build: "vite build",
            serve: "vite preview",
            dev: "vite dev --port=3001",
          },
          dependencies: {
            "radix-ui": "^1.4.2",
            "@tanstack/react-form": "^1.0.5",
            "@tailwindcss/vite": "^4.1.8",
            "@tanstack/react-query": "^5.80.6",
            "@tanstack/react-router": "^1.121.0-alpha.27",
            "@tanstack/react-router-with-query": "^1.121.0",
            "@tanstack/react-start": "^1.121.0-alpha.27",
            "@tanstack/router-plugin": "^1.121.0",
            "class-variance-authority": "^0.7.1",
            clsx: "^2.1.1",
            "lucide-react": "^0.473.0",
            "next-themes": "^0.4.6",
            react: "19.0.0",
            "react-dom": "19.0.0",
            sonner: "^2.0.3",
            tailwindcss: "^4.1.3",
            "tailwind-merge": "^2.6.0",
            "tw-animate-css": "^1.2.5",
            "vite-tsconfig-paths": "^5.1.4",
            zod: "^3.25.16",
          },
          devDependencies: {
            "@tanstack/react-router-devtools": "^1.121.0-alpha.27",
            "@testing-library/dom": "^10.4.0",
            "@testing-library/react": "^16.2.0",
            "@types/react": "^19.0.12",
            "@types/react-dom": "^19.0.4",
            "@vitejs/plugin-react": "^4.5.2",
            jsdom: "^26.0.0",
            typescript: "^5.7.2",
            vite: "^6.3.5",
            "web-vitals": "^4.2.4",
          },
        } satisfies PackageJson,
        type: "json",
      },
      "frontend/react/tanstack-start/public/robots.txt": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "044ce68f83",
        },
        content: `# https://www.robotstxt.org/robotstxt.html\nUser-agent: *\nDisallow:\n`,
        type: "text",
      },
      "frontend/react/tanstack-start/src/router.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "05eb2ab70d",
        },
        content: `{{#if (eq backend "convex")}}\nimport { createRouter as createTanStackRouter } from "@tanstack/react-router";\nimport { QueryClient } from "@tanstack/react-query";\nimport { routerWithQueryClient } from "@tanstack/react-router-with-query";\nimport { ConvexQueryClient } from "@convex-dev/react-query";\nimport { ConvexProvider } from "convex/react";\nimport { routeTree } from "./routeTree.gen";\nimport Loader from "./components/loader";\nimport "./index.css";\n{{else}}\nimport { createRouter as createTanStackRouter } from "@tanstack/react-router";\nimport Loader from "./components/loader";\nimport "./index.css";\nimport { routeTree } from "./routeTree.gen";\n  {{#if (eq api "trpc")}}\nimport { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";\nimport { createTRPCClient, httpBatchLink } from "@trpc/client";\nimport { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";\nimport { toast } from "sonner";\nimport type { AppRouter } from "../../server/src/routers";\nimport { TRPCProvider } from "./utils/trpc";\n  {{else if (eq api "orpc")}}\nimport { QueryClientProvider } from "@tanstack/react-query";\nimport { orpc, queryClient } from "./utils/orpc";\n  {{/if}}\n{{/if}}\n\n{{#if (eq backend "convex")}}\nexport function createRouter() {\n  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;\n  if (!CONVEX_URL) {\n    console.error("missing envar VITE_CONVEX_URL");\n  }\n  const convexQueryClient = new ConvexQueryClient(CONVEX_URL);\n\n  const queryClient: QueryClient = new QueryClient({\n    defaultOptions: {\n      queries: {\n        queryKeyHashFn: convexQueryClient.hashFn(),\n        queryFn: convexQueryClient.queryFn(),\n      },\n    },\n  });\n  convexQueryClient.connect(queryClient);\n\n  const router = routerWithQueryClient(\n    createTanStackRouter({\n      routeTree,\n      defaultPreload: "intent",\n      defaultPendingComponent: () => <Loader />,\n      defaultNotFoundComponent: () => <div>Not Found</div>,\n      context: { queryClient },\n      Wrap: ({ children }) => (\n        <ConvexProvider client={convexQueryClient.convexClient}>\n          {children}\n        </ConvexProvider>\n      ),\n    }),\n    queryClient,\n  );\n  return router;\n}\n{{else}}\n  {{#if (eq api "trpc")}}\nexport const queryClient = new QueryClient({\n  queryCache: new QueryCache({\n    onError: (error) => {\n      toast.error(error.message, {\n        action: {\n          label: "retry",\n          onClick: () => {\n            queryClient.invalidateQueries();\n          },\n        },\n      });\n    },\n  }),\n  defaultOptions: { queries: { staleTime: 60 * 1000 } },\n});\n\nconst trpcClient = createTRPCClient<AppRouter>({\n  links: [\n    httpBatchLink({\n      url: \`\${import.meta.env.VITE_SERVER_URL}/trpc\`,\n      {{#if auth}}\n      fetch(url, options) {\n        return fetch(url, {\n          ...options,\n          credentials: "include",\n        });\n      },\n      {{/if}}\n    }),\n  ],\n});\n\nconst trpc = createTRPCOptionsProxy({\n  client: trpcClient,\n  queryClient: queryClient,\n});\n  {{else if (eq api "orpc")}}\n  {{/if}}\n\nexport const createRouter = () => {\n  const router = createTanStackRouter({\n    routeTree,\n    scrollRestoration: true,\n    defaultPreloadStaleTime: 0,\n    {{#if (eq api "trpc")}}\n    context: { trpc, queryClient },\n    {{else if (eq api "orpc")}}\n    context: { orpc, queryClient },\n    {{else}}\n    context: {},\n    {{/if}}\n    defaultPendingComponent: () => <Loader />,\n    defaultNotFoundComponent: () => <div>Not Found</div>,\n    {{#if (eq api "trpc")}}\n    Wrap: ({ children }) => (\n      <QueryClientProvider client={queryClient}>\n        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>\n          {children}\n        </TRPCProvider>\n      </QueryClientProvider>\n    ),\n    {{else if (eq api "orpc")}}\n    Wrap: ({ children }) => (\n      <QueryClientProvider client={queryClient}>\n        {children}\n      </QueryClientProvider>\n    ),\n    {{else}}\n    Wrap: ({ children }) => <>{children}</>,\n    {{/if}}\n  });\n  return router;\n};\n{{/if}}\n\ndeclare module "@tanstack/react-router" {\n  interface Register {\n    router: ReturnType<typeof createRouter>;\n  }\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-start/src/routes/index.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "bdd4031ca9",
        },
        content: `import { createFileRoute } from "@tanstack/react-router";\n{{#if (eq backend "convex")}}\nimport { convexQuery } from "@convex-dev/react-query";\nimport { useSuspenseQuery } from "@tanstack/react-query";\nimport { api } from "@{{projectName}}/backend/convex/_generated/api";\n{{else if (or (eq api "trpc") (eq api "orpc"))}}\nimport { useQuery } from "@tanstack/react-query";\n  {{#if (eq api "trpc")}}\nimport { useTRPC } from "@/utils/trpc";\n  {{/if}}\n  {{#if (eq api "orpc")}}\nimport { orpc } from "@/utils/orpc";\n  {{/if}}\n{{/if}}\n\nexport const Route = createFileRoute("/")({\n  component: HomeComponent,\n});\n\nconst TITLE_TEXT = \`\n ██████╗ ███████╗████████╗████████╗███████╗██████╗\n ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗\n ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝\n    ██║       ███████╗   ██║   ███████║██║     █████╔╝\n    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗\n    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗\n    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\n \`;\n\nfunction HomeComponent() {\n  {{#if (eq backend "convex")}}\n  const healthCheck = useSuspenseQuery(convexQuery(api.healthCheck.get, {}));\n  {{else if (eq api "trpc")}}\n  const trpc = useTRPC();\n  const healthCheck = useQuery(trpc.healthCheck.queryOptions());\n  {{else if (eq api "orpc")}}\n  const healthCheck = useQuery(orpc.healthCheck.queryOptions());\n  {{/if}}\n\n  return (\n    <div className="container mx-auto max-w-3xl px-4 py-2">\n      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>\n      <div className="grid gap-6">\n        <section className="rounded-lg border p-4">\n          <h2 className="mb-2 font-medium">API Status</h2>\n          {{#if (eq backend "convex")}}\n          <div className="flex items-center gap-2">\n            <div\n              className={\`h-2 w-2 rounded-full \${healthCheck.data === "OK" ? "bg-green-500" : healthCheck.isLoading ? "bg-orange-400" : "bg-red-500"}\`}\n            />\n            <span className="text-muted-foreground text-sm">\n              {healthCheck.isLoading\n                ? "Checking..."\n                : healthCheck.data === "OK"\n                  ? "Connected"\n                  : "Error"}\n            </span>\n          </div>\n          {{else}}\n            {{#unless (eq api "none")}}\n            <div className="flex items-center gap-2">\n              <div\n                className={\`h-2 w-2 rounded-full \${healthCheck.data ? "bg-green-500" : "bg-red-500"}\`}\n              />\n              <span className="text-muted-foreground text-sm">\n                {healthCheck.isLoading\n                  ? "Checking..."\n                  : healthCheck.data\n                    ? "Connected"\n                    : "Disconnected"}\n              </span>\n            </div>\n            {{/unless}}\n          {{/if}}\n        </section>\n      </div>\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-start/src/routes/__root.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "34f85c30d9",
        },
        content: `import { Toaster } from "@/components/ui/sonner";\n{{#unless (eq backend "convex")}} {{#unless (eq api "none")}}\nimport { ReactQueryDevtools } from "@tanstack/react-query-devtools";\n{{/unless}} {{/unless}}\nimport {\n  HeadContent,\n  Outlet,\n  Scripts,\n  createRootRouteWithContext,\n  useRouterState,\n} from "@tanstack/react-router";\nimport { TanStackRouterDevtools } from "@tanstack/react-router-devtools";\nimport Header from "../components/header";\nimport appCss from "../index.css?url";\n{{#if (eq backend "convex")}}\nimport type { QueryClient } from "@tanstack/react-query";\n{{else}}\n  {{#unless (eq api "none")}}\nimport type { QueryClient } from "@tanstack/react-query";\n  {{/unless}}\n{{/if}}\nimport Loader from "@/components/loader";\n\n{{#if (eq backend "convex")}}\nexport interface RouterAppContext {\n  queryClient: QueryClient;\n}\n{{else}}\n  {{#if (eq api "trpc")}}\nimport type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";\nimport type { AppRouter } from "../../../server/src/routers";\nexport interface RouterAppContext {\n  trpc: TRPCOptionsProxy<AppRouter>;\n  queryClient: QueryClient;\n}\n  {{else if (eq api "orpc")}}\nimport type { orpc } from "@/utils/orpc";\nexport interface RouterAppContext {\n  orpc: typeof orpc;\n  queryClient: QueryClient;\n}\n  {{else}}\nexport interface RouterAppContext {\n}\n  {{/if}}\n{{/if}}\n\nexport const Route = createRootRouteWithContext<RouterAppContext>()({\n  head: () => ({\n    meta: [\n      {\n        charSet: "utf-8",\n      },\n      {\n        name: "viewport",\n        content: "width=device-width, initial-scale=1",\n      },\n      {\n        title: "My App",\n      },\n    ],\n    links: [\n      {\n        rel: "stylesheet",\n        href: appCss,\n      },\n    ],\n  }),\n\n  component: RootDocument,\n});\n\nfunction RootDocument() {\n  const isFetching = useRouterState({ select: (s) => s.isLoading });\n\n  return (\n    <html lang="en" className="dark">\n      <head>\n        <HeadContent />\n      </head>\n      <body>\n        <div className="grid h-svh grid-rows-[auto_1fr]">\n          <Header />\n          {isFetching ? <Loader /> : <Outlet />}\n        </div>\n        <Toaster richColors />\n        <TanStackRouterDevtools position="bottom-left" />\n        {{#unless (eq backend "convex")}}\n          {{#unless (eq api "none")}}\n        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />\n          {{/unless}}\n        {{/unless}}\n        <Scripts />\n      </body>\n    </html>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-start/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "1e56916e46",
        },
        content: `{\n  "include": ["**/*.ts", "**/*.tsx"],\n  "compilerOptions": {\n    "target": "ES2022",\n    "jsx": "react-jsx",\n    "module": "ESNext",\n    "lib": ["ES2022", "DOM", "DOM.Iterable"],\n    "types": ["vite/client"],\n\n    /* Bundler mode */\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "verbatimModuleSyntax": true,\n    "noEmit": true,\n\n    /* Linting */\n    "skipLibCheck": true,\n    "strict": true,\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "noFallthroughCasesInSwitch": true,\n    "noUncheckedSideEffectImports": true,\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  },\n  {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n}\n`,
        type: "text",
      },
      "frontend/react/tanstack-start/vite.config.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e855f1eec5",
        },
        content: `import { defineConfig } from "vite";\nimport tsconfigPaths from "vite-tsconfig-paths";\nimport { tanstackStart } from "@tanstack/react-start/plugin/vite";\nimport tailwindcss from "@tailwindcss/vite";\n\nexport default defineConfig({\n  plugins: [tsconfigPaths(), tailwindcss(), tanstackStart({})],\n});\n`,
        type: "text",
      },
      "frontend/react/web-base/components.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "ee8beac397",
        },
        content: {
          $schema: "https://ui.shadcn.com/schema.json",
          style: "new-york",
          rsc: false,
          tsx: true,
          tailwind: {
            config: "",
            css: "src/index.css",
            baseColor: "neutral",
            cssVariables: true,
            prefix: "",
          },
          aliases: {
            components: "@/components",
            utils: "@/lib/utils",
            ui: "@/components/ui",
            lib: "@/lib",
            hooks: "@/hooks",
          },
          iconLibrary: "lucide",
        },
        type: "json",
      },
      "frontend/react/web-base/src/components/header.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "1c81a3e632",
        },
        content: `{{#if (includes frontend "next")}}\n"use client";\nimport Link from "next/link";\n{{else if (includes frontend "react-router")}}\nimport { NavLink } from "react-router";\n{{else if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}\nimport { Link } from "@tanstack/react-router";\n{{/if}}\n\n{{#unless (includes frontend "tanstack-start")}}\nimport { ModeToggle } from "./mode-toggle";\n{{/unless}}\n{{#if auth}}\nimport UserMenu from "./user-menu";\n{{/if}}\n\nexport default function Header() {\n  const links = [\n    { to: "/", label: "Home" },\n    {{#if auth}}\n      { to: "/dashboard", label: "Dashboard" },\n    {{/if}}\n    {{#if (includes examples "todo")}}\n    { to: "/todos", label: "Todos" },\n    {{/if}}\n    {{#if (includes examples "ai")}}\n    { to: "/ai", label: "AI Chat" },\n    {{/if}}\n  ];\n\n  return (\n    <div>\n      <div className="flex flex-row items-center justify-between px-2 py-1">\n        <nav className="flex gap-4 text-lg">\n          {links.map(({ to, label }) => {\n            {{#if (includes frontend "next")}}\n            return (\n              <Link key={to} href={to}>\n                {label}\n              </Link>\n            );\n            {{else if (includes frontend "react-router")}}\n            return (\n              <NavLink\n                key={to}\n                to={to}\n                className={({ isActive }) => isActive ? "font-bold" : ""}\n                end\n              >\n                {label}\n              </NavLink>\n            );\n            {{else if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}\n            return (\n              <Link\n                key={to}\n                to={to}\n              >\n                {label}\n              </Link>\n            );\n            {{else}}\n            return null;\n            {{/if}}\n          })}\n        </nav>\n        <div className="flex items-center gap-2">\n          {{#unless (includes frontend "tanstack-start")}}\n          <ModeToggle />\n          {{/unless}}\n          {{#if auth}}\n          <UserMenu />\n          {{/if}}\n        </div>\n      </div>\n      <hr />\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/loader.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "a4cb8b00c3",
        },
        content: `import { Loader2 } from "lucide-react";\n\nexport default function Loader() {\n  return (\n    <div className="flex h-full items-center justify-center pt-8">\n      <Loader2 className="animate-spin" />\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/ui/button.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "8ad929f6d5",
        },
        content: `import * as React from "react"\nimport { Slot as SlotPrimitive } from "radix-ui"\nimport { cva, type VariantProps } from "class-variance-authority"\n\nimport { cn } from "@/lib/utils"\n\nconst buttonVariants = cva(\n  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",\n  {\n    variants: {\n      variant: {\n        default:\n          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",\n        destructive:\n          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",\n        outline:\n          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",\n        secondary:\n          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",\n        ghost:\n          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",\n        link: "text-primary underline-offset-4 hover:underline",\n      },\n      size: {\n        default: "h-9 px-4 py-2 has-[>svg]:px-3",\n        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",\n        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",\n        icon: "size-9",\n      },\n    },\n    defaultVariants: {\n      variant: "default",\n      size: "default",\n    },\n  }\n)\n\nfunction Button({\n  className,\n  variant,\n  size,\n  asChild = false,\n  ...props\n}: React.ComponentProps<"button"> &\n  VariantProps<typeof buttonVariants> & {\n    asChild?: boolean\n  }) {\n  const Comp = asChild ? SlotPrimitive.Slot : "button"\n\n  return (\n    <Comp\n      data-slot="button"\n      className={cn(buttonVariants({ variant, size, className }))}\n      {...props}\n    />\n  )\n}\n\nexport { Button, buttonVariants }\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/ui/card.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "99cd1857f4",
        },
        content: `import * as React from "react"\n\nimport { cn } from "@/lib/utils"\n\nfunction Card({ className, ...props }: React.ComponentProps<"div">) {\n  return (\n    <div\n      data-slot="card"\n      className={cn(\n        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nfunction CardHeader({ className, ...props }: React.ComponentProps<"div">) {\n  return (\n    <div\n      data-slot="card-header"\n      className={cn(\n        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nfunction CardTitle({ className, ...props }: React.ComponentProps<"div">) {\n  return (\n    <div\n      data-slot="card-title"\n      className={cn("leading-none font-semibold", className)}\n      {...props}\n    />\n  )\n}\n\nfunction CardDescription({ className, ...props }: React.ComponentProps<"div">) {\n  return (\n    <div\n      data-slot="card-description"\n      className={cn("text-muted-foreground text-sm", className)}\n      {...props}\n    />\n  )\n}\n\nfunction CardAction({ className, ...props }: React.ComponentProps<"div">) {\n  return (\n    <div\n      data-slot="card-action"\n      className={cn(\n        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nfunction CardContent({ className, ...props }: React.ComponentProps<"div">) {\n  return (\n    <div\n      data-slot="card-content"\n      className={cn("px-6", className)}\n      {...props}\n    />\n  )\n}\n\nfunction CardFooter({ className, ...props }: React.ComponentProps<"div">) {\n  return (\n    <div\n      data-slot="card-footer"\n      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}\n      {...props}\n    />\n  )\n}\n\nexport {\n  Card,\n  CardHeader,\n  CardFooter,\n  CardTitle,\n  CardAction,\n  CardDescription,\n  CardContent,\n}\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/ui/checkbox.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "7b47855622",
        },
        content: `import * as React from "react"\nimport { Checkbox as CheckboxPrimitive } from "radix-ui"\nimport { CheckIcon } from "lucide-react"\n\nimport { cn } from "@/lib/utils"\n\nfunction Checkbox({\n  className,\n  ...props\n}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {\n  return (\n    <CheckboxPrimitive.Root\n      data-slot="checkbox"\n      className={cn(\n        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",\n        className\n      )}\n      {...props}\n    >\n      <CheckboxPrimitive.Indicator\n        data-slot="checkbox-indicator"\n        className="flex items-center justify-center text-current transition-none"\n      >\n        <CheckIcon className="size-3.5" />\n      </CheckboxPrimitive.Indicator>\n    </CheckboxPrimitive.Root>\n  )\n}\n\nexport { Checkbox }\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/ui/dropdown-menu.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "30279c29d1",
        },
        content: `"use client"\n\nimport * as React from "react"\nimport { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"\nimport { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"\n\nimport { cn } from "@/lib/utils"\n\nfunction DropdownMenu({\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {\n  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />\n}\n\nfunction DropdownMenuPortal({\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {\n  return (\n    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />\n  )\n}\n\nfunction DropdownMenuTrigger({\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {\n  return (\n    <DropdownMenuPrimitive.Trigger\n      data-slot="dropdown-menu-trigger"\n      {...props}\n    />\n  )\n}\n\nfunction DropdownMenuContent({\n  className,\n  sideOffset = 4,\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {\n  return (\n    <DropdownMenuPrimitive.Portal>\n      <DropdownMenuPrimitive.Content\n        data-slot="dropdown-menu-content"\n        sideOffset={sideOffset}\n        className={cn(\n          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",\n          className\n        )}\n        {...props}\n      />\n    </DropdownMenuPrimitive.Portal>\n  )\n}\n\nfunction DropdownMenuGroup({\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {\n  return (\n    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />\n  )\n}\n\nfunction DropdownMenuItem({\n  className,\n  inset,\n  variant = "default",\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {\n  inset?: boolean\n  variant?: "default" | "destructive"\n}) {\n  return (\n    <DropdownMenuPrimitive.Item\n      data-slot="dropdown-menu-item"\n      data-inset={inset}\n      data-variant={variant}\n      className={cn(\n        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nfunction DropdownMenuCheckboxItem({\n  className,\n  children,\n  checked,\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {\n  return (\n    <DropdownMenuPrimitive.CheckboxItem\n      data-slot="dropdown-menu-checkbox-item"\n      className={cn(\n        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",\n        className\n      )}\n      checked={checked}\n      {...props}\n    >\n      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">\n        <DropdownMenuPrimitive.ItemIndicator>\n          <CheckIcon className="size-4" />\n        </DropdownMenuPrimitive.ItemIndicator>\n      </span>\n      {children}\n    </DropdownMenuPrimitive.CheckboxItem>\n  )\n}\n\nfunction DropdownMenuRadioGroup({\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {\n  return (\n    <DropdownMenuPrimitive.RadioGroup\n      data-slot="dropdown-menu-radio-group"\n      {...props}\n    />\n  )\n}\n\nfunction DropdownMenuRadioItem({\n  className,\n  children,\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {\n  return (\n    <DropdownMenuPrimitive.RadioItem\n      data-slot="dropdown-menu-radio-item"\n      className={cn(\n        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",\n        className\n      )}\n      {...props}\n    >\n      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">\n        <DropdownMenuPrimitive.ItemIndicator>\n          <CircleIcon className="size-2 fill-current" />\n        </DropdownMenuPrimitive.ItemIndicator>\n      </span>\n      {children}\n    </DropdownMenuPrimitive.RadioItem>\n  )\n}\n\nfunction DropdownMenuLabel({\n  className,\n  inset,\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {\n  inset?: boolean\n}) {\n  return (\n    <DropdownMenuPrimitive.Label\n      data-slot="dropdown-menu-label"\n      data-inset={inset}\n      className={cn(\n        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nfunction DropdownMenuSeparator({\n  className,\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {\n  return (\n    <DropdownMenuPrimitive.Separator\n      data-slot="dropdown-menu-separator"\n      className={cn("bg-border -mx-1 my-1 h-px", className)}\n      {...props}\n    />\n  )\n}\n\nfunction DropdownMenuShortcut({\n  className,\n  ...props\n}: React.ComponentProps<"span">) {\n  return (\n    <span\n      data-slot="dropdown-menu-shortcut"\n      className={cn(\n        "text-muted-foreground ml-auto text-xs tracking-widest",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nfunction DropdownMenuSub({\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {\n  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />\n}\n\nfunction DropdownMenuSubTrigger({\n  className,\n  inset,\n  children,\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {\n  inset?: boolean\n}) {\n  return (\n    <DropdownMenuPrimitive.SubTrigger\n      data-slot="dropdown-menu-sub-trigger"\n      data-inset={inset}\n      className={cn(\n        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",\n        className\n      )}\n      {...props}\n    >\n      {children}\n      <ChevronRightIcon className="ml-auto size-4" />\n    </DropdownMenuPrimitive.SubTrigger>\n  )\n}\n\nfunction DropdownMenuSubContent({\n  className,\n  ...props\n}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {\n  return (\n    <DropdownMenuPrimitive.SubContent\n      data-slot="dropdown-menu-sub-content"\n      className={cn(\n        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nexport {\n  DropdownMenu,\n  DropdownMenuPortal,\n  DropdownMenuTrigger,\n  DropdownMenuContent,\n  DropdownMenuGroup,\n  DropdownMenuLabel,\n  DropdownMenuItem,\n  DropdownMenuCheckboxItem,\n  DropdownMenuRadioGroup,\n  DropdownMenuRadioItem,\n  DropdownMenuSeparator,\n  DropdownMenuShortcut,\n  DropdownMenuSub,\n  DropdownMenuSubTrigger,\n  DropdownMenuSubContent,\n}\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/ui/input.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d604373f8d",
        },
        content: `import * as React from "react"\n\nimport { cn } from "@/lib/utils"\n\nfunction Input({ className, type, ...props }: React.ComponentProps<"input">) {\n  return (\n    <input\n      type={type}\n      data-slot="input"\n      className={cn(\n        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",\n        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",\n        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nexport { Input }\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/ui/label.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "c886e2ca42",
        },
        content: `import * as React from "react"\nimport { Label as LabelPrimitive } from "radix-ui"\n\nimport { cn } from "@/lib/utils"\n\nfunction Label({\n  className,\n  ...props\n}: React.ComponentProps<typeof LabelPrimitive.Root>) {\n  return (\n    <LabelPrimitive.Root\n      data-slot="label"\n      className={cn(\n        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",\n        className\n      )}\n      {...props}\n    />\n  )\n}\n\nexport { Label }\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/ui/skeleton.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "08ceeb5c59",
        },
        content: `import { cn } from "@/lib/utils"\n\nfunction Skeleton({ className, ...props }: React.ComponentProps<"div">) {\n  return (\n    <div\n      data-slot="skeleton"\n      className={cn("bg-accent animate-pulse rounded-md", className)}\n      {...props}\n    />\n  )\n}\n\nexport { Skeleton }\n`,
        type: "text",
      },
      "frontend/react/web-base/src/components/ui/sonner.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "66328a582a",
        },
        content: `"use client";\n\nimport { useTheme } from "next-themes";\nimport { Toaster as Sonner, type ToasterProps } from "sonner";\n\nconst Toaster = ({ ...props }: ToasterProps) => {\n  const { theme = "system" } = useTheme();\n\n  return (\n    <Sonner\n      theme={theme as ToasterProps["theme"]}\n      className="toaster group"\n      style={\n        {\n          "--normal-bg": "var(--popover)",\n          "--normal-text": "var(--popover-foreground)",\n          "--normal-border": "var(--border)",\n        } as React.CSSProperties\n      }\n      {...props}\n    />\n  );\n};\n\nexport { Toaster };\n`,
        type: "text",
      },
      "frontend/react/web-base/src/index.css": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "539f553728",
        },
        content: `@import "tailwindcss";\n@import "tw-animate-css";\n\n@custom-variant dark (&:where(.dark, .dark *));\n\n@theme {\n  --font-sans: "Inter", "Geist", ui-sans-serif, system-ui, sans-serif,\n    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";\n}\n\nhtml,\nbody {\n  @apply bg-white dark:bg-gray-950;\n\n  @media (prefers-color-scheme: dark) {\n    color-scheme: dark;\n  }\n}\n\n:root {\n  --radius: 0.625rem;\n  --background: oklch(1 0 0);\n  --foreground: oklch(0.145 0 0);\n  --card: oklch(1 0 0);\n  --card-foreground: oklch(0.145 0 0);\n  --popover: oklch(1 0 0);\n  --popover-foreground: oklch(0.145 0 0);\n  --primary: oklch(0.205 0 0);\n  --primary-foreground: oklch(0.985 0 0);\n  --secondary: oklch(0.97 0 0);\n  --secondary-foreground: oklch(0.205 0 0);\n  --muted: oklch(0.97 0 0);\n  --muted-foreground: oklch(0.556 0 0);\n  --accent: oklch(0.97 0 0);\n  --accent-foreground: oklch(0.205 0 0);\n  --destructive: oklch(0.577 0.245 27.325);\n  --border: oklch(0.922 0 0);\n  --input: oklch(0.922 0 0);\n  --ring: oklch(0.708 0 0);\n  --chart-1: oklch(0.646 0.222 41.116);\n  --chart-2: oklch(0.6 0.118 184.704);\n  --chart-3: oklch(0.398 0.07 227.392);\n  --chart-4: oklch(0.828 0.189 84.429);\n  --chart-5: oklch(0.769 0.188 70.08);\n  --sidebar: oklch(0.985 0 0);\n  --sidebar-foreground: oklch(0.145 0 0);\n  --sidebar-primary: oklch(0.205 0 0);\n  --sidebar-primary-foreground: oklch(0.985 0 0);\n  --sidebar-accent: oklch(0.97 0 0);\n  --sidebar-accent-foreground: oklch(0.205 0 0);\n  --sidebar-border: oklch(0.922 0 0);\n  --sidebar-ring: oklch(0.708 0 0);\n}\n\n.dark {\n  --background: oklch(0.145 0 0);\n  --foreground: oklch(0.985 0 0);\n  --card: oklch(0.205 0 0);\n  --card-foreground: oklch(0.985 0 0);\n  --popover: oklch(0.205 0 0);\n  --popover-foreground: oklch(0.985 0 0);\n  --primary: oklch(0.922 0 0);\n  --primary-foreground: oklch(0.205 0 0);\n  --secondary: oklch(0.269 0 0);\n  --secondary-foreground: oklch(0.985 0 0);\n  --muted: oklch(0.269 0 0);\n  --muted-foreground: oklch(0.708 0 0);\n  --accent: oklch(0.269 0 0);\n  --accent-foreground: oklch(0.985 0 0);\n  --destructive: oklch(0.704 0.191 22.216);\n  --border: oklch(1 0 0 / 10%);\n  --input: oklch(1 0 0 / 15%);\n  --ring: oklch(0.556 0 0);\n  --chart-1: oklch(0.488 0.243 264.376);\n  --chart-2: oklch(0.696 0.17 162.48);\n  --chart-3: oklch(0.769 0.188 70.08);\n  --chart-4: oklch(0.627 0.265 303.9);\n  --chart-5: oklch(0.645 0.246 16.439);\n  --sidebar: oklch(0.205 0 0);\n  --sidebar-foreground: oklch(0.985 0 0);\n  --sidebar-primary: oklch(0.488 0.243 264.376);\n  --sidebar-primary-foreground: oklch(0.985 0 0);\n  --sidebar-accent: oklch(0.269 0 0);\n  --sidebar-accent-foreground: oklch(0.985 0 0);\n  --sidebar-border: oklch(1 0 0 / 10%);\n  --sidebar-ring: oklch(0.556 0 0);\n}\n\n@theme inline {\n  --radius-sm: calc(var(--radius) - 4px);\n  --radius-md: calc(var(--radius) - 2px);\n  --radius-lg: var(--radius);\n  --radius-xl: calc(var(--radius) + 4px);\n  --color-background: var(--background);\n  --color-foreground: var(--foreground);\n  --color-card: var(--card);\n  --color-card-foreground: var(--card-foreground);\n  --color-popover: var(--popover);\n  --color-popover-foreground: var(--popover-foreground);\n  --color-primary: var(--primary);\n  --color-primary-foreground: var(--primary-foreground);\n  --color-secondary: var(--secondary);\n  --color-secondary-foreground: var(--secondary-foreground);\n  --color-muted: var(--muted);\n  --color-muted-foreground: var(--muted-foreground);\n  --color-accent: var(--accent);\n  --color-accent-foreground: var(--accent-foreground);\n  --color-destructive: var(--destructive);\n  --color-border: var(--border);\n  --color-input: var(--input);\n  --color-ring: var(--ring);\n  --color-chart-1: var(--chart-1);\n  --color-chart-2: var(--chart-2);\n  --color-chart-3: var(--chart-3);\n  --color-chart-4: var(--chart-4);\n  --color-chart-5: var(--chart-5);\n  --color-sidebar: var(--sidebar);\n  --color-sidebar-foreground: var(--sidebar-foreground);\n  --color-sidebar-primary: var(--sidebar-primary);\n  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);\n  --color-sidebar-accent: var(--sidebar-accent);\n  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);\n  --color-sidebar-border: var(--sidebar-border);\n  --color-sidebar-ring: var(--sidebar-ring);\n}\n\n@layer base {\n  * {\n    @apply border-border outline-ring/50;\n  }\n  body {\n    @apply bg-background text-foreground;\n  }\n}\n`,
        type: "text",
      },
      "frontend/react/web-base/src/lib/utils.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "03edf7b44c",
        },
        content: `import { clsx, type ClassValue } from "clsx"\nimport { twMerge } from "tailwind-merge"\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs))\n}\n`,
        type: "text",
      },
      "frontend/react/web-base/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "52c37209ea",
        },
        content: `# Dependencies\n/node_modules\n/.pnp\n.pnp.*\n.yarn/*\n!.yarn/patches\n!.yarn/plugins\n!.yarn/releases\n!.yarn/versions\n\n# Testing\n/coverage\n\n# Build outputs\n/.next/\n/out/\n/build/\n/dist/\n.vinxi\n.output\n.react-router/\n\n# Deployment\n.vercel\n.netlify\n.wrangler\n\n# Environment & local files\n.env*\n!.env.example\n.DS_Store\n*.pem\n*.local\n\n# Logs\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n.pnpm-debug.log*\n*.log*\n\n# TypeScript\n*.tsbuildinfo\nnext-env.d.ts\n\n# IDE\n.vscode/*\n!.vscode/extensions.json\n.idea\n\n# Other\ndev-dist\n`,
        type: "text",
      },
      "frontend/solid/index.html": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "77e78e2f7e",
        },
        content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="icon" href="/favicon.ico" />\n    <meta name="theme-color" content="#000000" />\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`,
        type: "text",
      },
      "frontend/solid/package.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "2daf6f7896",
        },
        content: {
          name: "web",
          private: true,
          type: "module",
          scripts: {
            dev: "vite --port 3001",
            build: "vite build && tsc",
            serve: "vite preview",
            test: "vitest run",
          },
          dependencies: {
            "@tailwindcss/vite": "^4.0.6",
            "@tanstack/router-plugin": "^1.109.2",
            "@tanstack/solid-form": "^1.9.0",
            "@tanstack/solid-router": "^1.110.0",
            "@tanstack/solid-router-devtools": "^1.109.2",
            "lucide-solid": "^0.507.0",
            "solid-js": "^1.9.4",
            tailwindcss: "^4.0.6",
            zod: "^3.25.16",
          },
          devDependencies: {
            typescript: "^5.7.2",
            vite: "^6.0.11",
            "vite-plugin-solid": "^2.11.2",
          },
        } satisfies PackageJson,
        type: "json",
      },
      "frontend/solid/public/robots.txt": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "044ce68f83",
        },
        content: `# https://www.robotstxt.org/robotstxt.html\nUser-agent: *\nDisallow:\n`,
        type: "text",
      },
      "frontend/solid/src/components/header.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b4f0c53d1a",
        },
        content: `import { Link } from "@tanstack/solid-router";\n{{#if auth}}\nimport UserMenu from "./user-menu";\n{{/if}}\nimport { For } from "solid-js";\n\nexport default function Header() {\n  const links = [\n    { to: "/", label: "Home" },\n    {{#if auth}}\n    { to: "/dashboard", label: "Dashboard" },\n    {{/if}}\n    {{#if (includes examples "todo")}}\n    { to: "/todos", label: "Todos" },\n    {{/if}}\n    {{#if (includes examples "ai")}}\n    { to: "/ai", label: "AI Chat" },\n    {{/if}}\n  ];\n\n  return (\n    <div>\n      <div class="flex flex-row items-center justify-between px-2 py-1">\n        <nav class="flex gap-4 text-lg">\n          <For each={links}>\n            {(link) => <Link to={link.to}>{link.label}</Link>}\n          </For>\n        </nav>\n        <div class="flex items-center gap-2">\n          {{#if auth}}\n          <UserMenu />\n          {{/if}}\n        </div>\n      </div>\n      <hr />\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/solid/src/components/loader.tsx": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "8fcee563b2",
        },
        content: `import { Loader2 } from "lucide-solid";\n\nexport default function Loader() {\n  return (\n    <div class="flex h-full items-center justify-center pt-8">\n      <Loader2 class="animate-spin" />\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/solid/src/main.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "66bfbf0b30",
        },
        content: `import { RouterProvider, createRouter } from "@tanstack/solid-router";\nimport { render } from "solid-js/web";\nimport { routeTree } from "./routeTree.gen";\nimport "./styles.css";\n{{#if (eq api "orpc")}}\nimport { QueryClientProvider } from "@tanstack/solid-query";\nimport { queryClient } from "./utils/orpc";\n{{/if}}\n\nconst router = createRouter({\n  routeTree,\n  defaultPreload: "intent",\n  scrollRestoration: true,\n  defaultPreloadStaleTime: 0,\n});\n\ndeclare module "@tanstack/solid-router" {\n  interface Register {\n    router: typeof router;\n  }\n}\n\nfunction App() {\n  return (\n    {{#if (eq api "orpc")}}\n    <QueryClientProvider client={queryClient}>\n    {{/if}}\n      <RouterProvider router={router} />\n    {{#if (eq api "orpc")}}\n    </QueryClientProvider>\n    {{/if}}\n  );\n}\n\nconst rootElement = document.getElementById("app");\nif (rootElement) {\n  render(() => <App />, rootElement);\n}\n`,
        type: "text",
      },
      "frontend/solid/src/routes/index.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "60e18448f9",
        },
        content: `import { createFileRoute } from "@tanstack/solid-router";\n{{#if (eq api "orpc")}}\nimport { useQuery } from "@tanstack/solid-query";\nimport { orpc } from "../utils/orpc";\nimport { Match, Switch } from "solid-js";\n{{else}}\n{{/if}}\n\nexport const Route = createFileRoute("/")({\n  component: App,\n});\n\nconst TITLE_TEXT = \`\n ██████╗ ███████╗████████╗████████╗███████╗██████╗\n ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗\n ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝\n    ██║       ███████╗   ██║   ███████║██║     █████╔╝\n    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗\n    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗\n    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\n \`;\n\nfunction App() {\n  {{#if (eq api "orpc")}}\n  const healthCheck = useQuery(() => orpc.healthCheck.queryOptions());\n  {{/if}}\n\n  return (\n    <div class="container mx-auto max-w-3xl px-4 py-2">\n      <pre class="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>\n      <div class="grid gap-6">\n        {{#if (eq api "orpc")}}\n        <section class="rounded-lg border p-4">\n          <h2 class="mb-2 font-medium">API Status</h2>\n          <Switch>\n            <Match when={healthCheck.isPending}>\n              <div class="flex items-center gap-2">\n                <div class="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />{" "}\n                <span class="text-sm text-muted-foreground">Checking...</span>\n              </div>\n            </Match>\n            <Match when={healthCheck.isError}>\n              <div class="flex items-center gap-2">\n                <div class="h-2 w-2 rounded-full bg-red-500" />\n                <span class="text-sm text-muted-foreground">Disconnected</span>\n              </div>\n            </Match>\n            <Match when={healthCheck.isSuccess}>\n              <div class="flex items-center gap-2">\n                <div\n                  class={\`h-2 w-2 rounded-full \${healthCheck.data ? "bg-green-500" : "bg-red-500"}\`}\n                />\n                <span class="text-sm text-muted-foreground">\n                  {healthCheck.data\n                    ? "Connected"\n                    : "Disconnected"}\n                </span>\n              </div>\n            </Match>\n          </Switch>\n        </section>\n        {{/if}}\n      </div>\n    </div>\n  );\n}\n`,
        type: "text",
      },
      "frontend/solid/src/routes/__root.tsx.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "5a588176fd",
        },
        content: `import Header from "@/components/header";\nimport { Outlet, createRootRouteWithContext } from "@tanstack/solid-router";\nimport { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";\n{{#if (eq api "orpc")}}\nimport { SolidQueryDevtools } from "@tanstack/solid-query-devtools";\nimport type { QueryClient } from "@tanstack/solid-query";\nimport type { orpc } from "../utils/orpc";\n\nexport interface RouterContext {\n  orpc: typeof orpc;\n  queryClient: QueryClient;\n}\n{{else}}\nexport interface RouterContext {}\n{{/if}}\n\nexport const Route = createRootRouteWithContext<RouterContext>()({\n  component: RootComponent,\n});\n\nfunction RootComponent() {\n  return (\n    <>\n      <div class="grid grid-rows-[auto_1fr] h-svh">\n        <Header />\n        <Outlet />\n      </div>\n      {{#if (eq api "orpc")}}\n      <SolidQueryDevtools />\n      {{/if}}\n      <TanStackRouterDevtools />\n    </>\n  );\n}\n`,
        type: "text",
      },
      "frontend/solid/src/styles.css": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "677a7d9b58",
        },
        content: `@import "tailwindcss";\n\nbody {\n  @apply bg-neutral-950 text-neutral-100;\n}\n`,
        type: "text",
      },
      "frontend/solid/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "5ae70989e9",
        },
        content: `{\n  "include": ["**/*.ts", "**/*.tsx"],\n  "compilerOptions": {\n    "target": "ES2022",\n    "jsx": "preserve",\n    "jsxImportSource": "solid-js",\n    "module": "ESNext",\n    "lib": ["ES2022", "DOM", "DOM.Iterable"],\n    "types": ["vite/client"],\n\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "verbatimModuleSyntax": true,\n    "noEmit": true,\n\n    "skipLibCheck": true,\n    "strict": true,\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "noFallthroughCasesInSwitch": true,\n    "noUncheckedSideEffectImports": true,\n\n    "rootDirs": ["."],\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  },\n  {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n}\n`,
        type: "text",
      },
      "frontend/solid/vite.config.js.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "650d7e34a2",
        },
        content: `import { defineConfig } from "vite";\nimport { TanStackRouterVite } from "@tanstack/router-plugin/vite";\nimport solidPlugin from "vite-plugin-solid";\nimport tailwindcss from "@tailwindcss/vite";\nimport path from "node:path";\n{{#if (includes addons "pwa")}}\nimport { VitePWA } from "vite-plugin-pwa";\n{{/if}}\n\nexport default defineConfig({\n  plugins: [\n    TanStackRouterVite({ target: "solid", autoCodeSplitting: true }),\n    solidPlugin(),\n    tailwindcss(),\n    {{#if (includes addons "pwa")}}\n    VitePWA({\n      registerType: "autoUpdate",\n      manifest: {\n        name: "{{projectName}}",\n        short_name: "{{projectName}}",\n        description: "{{projectName}} - PWA Application",\n        theme_color: "#0c0c0c",\n      },\n      pwaAssets: {\n        disabled: false,\n        config: true,\n      },\n      devOptions: {\n        enabled: true,\n      },\n    }),\n    {{/if}}\n  ],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },\n});\n`,
        type: "text",
      },
      "frontend/solid/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "da5f647df9",
        },
        content: `node_modules\n.DS_Store\ndist\ndist-ssr\n*.local\n.env\n.env.*\n`,
        type: "text",
      },
      "frontend/svelte/package.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "15e156a44b",
        },
        content: {
          name: "web",
          private: true,
          version: "0.0.1",
          type: "module",
          scripts: {
            dev: "vite dev",
            build: "vite build",
            preview: "vite preview",
            prepare: "svelte-kit sync || echo ''",
            check: "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
            "check:watch":
              "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
          },
          devDependencies: {
            "@sveltejs/adapter-auto": "^6.0.0",
            "@sveltejs/kit": "^2.20.7",
            "@sveltejs/vite-plugin-svelte": "^5.0.3",
            "@tailwindcss/vite": "^4.1.4",
            svelte: "^5.28.2",
            "svelte-check": "^4.1.6",
            tailwindcss: "^4.1.4",
            typescript: "^5.8.3",
            "@tanstack/svelte-query-devtools": "^5.74.6",
            vite: "^6.3.3",
          },
          dependencies: {
            "@tanstack/svelte-form": "^1.7.0",
            "@tanstack/svelte-query": "^5.74.4",
            zod: "^3.25.16",
          },
        } satisfies PackageJson,
        type: "json",
      },
      "frontend/svelte/src/app.css": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "2b911b4424",
        },
        content: `@import 'tailwindcss';\n\nbody {\n    @apply bg-neutral-950 text-neutral-100;\n}\n`,
        type: "text",
      },
      "frontend/svelte/src/app.d.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "2f59b5d092",
        },
        content: `// See https://svelte.dev/docs/kit/types#app.d.ts\n// for information about these interfaces\ndeclare global {\n	namespace App {\n		// interface Error {}\n		// interface Locals {}\n		// interface PageData {}\n		// interface PageState {}\n		// interface Platform {}\n	}\n}\n\nexport {};\n`,
        type: "text",
      },
      "frontend/svelte/src/app.html": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "f980132c60",
        },
        content: `<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="%sveltekit.assets%/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		%sveltekit.head%\n	</head>\n	<body data-sveltekit-preload-data="hover">\n		<div style="display: contents">%sveltekit.body%</div>\n	</body>\n</html>\n`,
        type: "text",
      },
      "frontend/svelte/src/components/Header.svelte.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "c6a47255ab",
        },
        content: `<script lang="ts">\n\n    {{#if auth}}\n	import UserMenu from './UserMenu.svelte';\n    {{/if}}\n    const links = [\n        { to: "/", label: "Home" },\n        {{#if auth}}\n        { to: "/dashboard", label: "Dashboard" },\n        {{/if}}\n        {{#if (includes examples "todo")}}\n        { to: "/todos", label: "Todos" },\n        {{/if}}\n        {{#if (includes examples "ai")}}\n        { to: "/ai", label: "AI Chat" },\n        {{/if}}\n    ];\n\n</script>\n\n<div>\n	<div class="flex flex-row items-center justify-between px-4 py-2 md:px-6">\n		<nav class="flex gap-4 text-lg">\n			{#each links as link (link.to)}\n				<a\n					href={link.to}\n					class=""\n				>\n					{link.label}\n				</a>\n			{/each}\n		</nav>\n		<div class="flex items-center gap-2">\n		    {{#if auth}}\n            <UserMenu />\n             {{/if}}\n		</div>\n	</div>\n	<hr class="border-neutral-800" />\n</div>\n`,
        type: "text",
      },
      "frontend/svelte/src/lib/index.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e8362765b9",
        },
        content: `// place files you want to import through the \`$lib\` alias in this folder.\n`,
        type: "text",
      },
      "frontend/svelte/src/routes/+layout.svelte.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d30b632052",
        },
        content: `{{#if (eq backend "convex")}}\n<script lang="ts">\n	import '../app.css';\n    import Header from '../components/Header.svelte';\n    import { PUBLIC_CONVEX_URL } from '$env/static/public';\n	import { setupConvex } from 'convex-svelte';\n\n	const { children } = $props();\n	setupConvex(PUBLIC_CONVEX_URL);\n</script>\n\n<div class="grid h-svh grid-rows-[auto_1fr]">\n	<Header />\n	<main class="overflow-y-auto">\n		{@render children()}\n	</main>\n</div>\n{{else}}\n  {{#if (eq api "orpc")}}\n<script lang="ts">\n    import { QueryClientProvider } from '@tanstack/svelte-query';\n    import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'\n	import '../app.css';\n    import { queryClient } from '$lib/orpc';\n    import Header from '../components/Header.svelte';\n\n	let { children } = $props();\n</script>\n\n<QueryClientProvider client={queryClient}>\n    <div class="grid h-svh grid-rows-[auto_1fr]">\n		<Header />\n		<main class="overflow-y-auto">\n			{@render children()}\n		</main>\n    </div>\n    <SvelteQueryDevtools />\n</QueryClientProvider>\n  {{else}}\n<script lang="ts">\n	import '../app.css';\n    import Header from '../components/Header.svelte';\n\n	let { children } = $props();\n</script>\n\n<div class="grid h-svh grid-rows-[auto_1fr]">\n	<Header />\n	<main class="overflow-y-auto">\n		{@render children()}\n	</main>\n</div>\n  {{/if}}\n{{/if}}\n`,
        type: "text",
      },
      "frontend/svelte/src/routes/+page.svelte.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "4575c675e2",
        },
        content: `{{#if (eq backend "convex")}}\n<script lang="ts">\nimport { useQuery } from 'convex-svelte';\nimport { api } from "@{{projectName}}/backend/convex/_generated/api";\n\nconst healthCheck = useQuery(api.healthCheck.get, {});\n\nconst TITLE_TEXT = \`\n   ██████╗ ███████╗████████╗████████╗███████╗██████╗\n   ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n   ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n   ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n   ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n   ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n   ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗\n   ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝\n      ██║       ███████╗   ██║   ███████║██║     █████╔╝\n      ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗\n      ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗\n      ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\n   \`;\n</script>\n\n<div class="container mx-auto max-w-3xl px-4 py-2">\n	<pre class="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>\n	<div class="grid gap-6">\n		<section class="rounded-lg border p-4">\n			<h2 class="mb-2 font-medium">API Status</h2>\n			<div class="flex items-center gap-2">\n				<div\n					class={\`h-2 w-2 rounded-full \${healthCheck.data ? "bg-green-500" : "bg-red-500"}\`}\n				></div>\n				<span class="text-muted-foreground text-sm">\n					{healthCheck.isLoading\n						? "Checking..."\n						: healthCheck.data\n							? "Connected"\n							: "Disconnected"}\n				</span>\n			</div>\n		</section>\n	</div>\n</div>\n{{else}}\n<script lang="ts">\n{{#if (eq api "orpc")}}\nimport { orpc } from "$lib/orpc";\nimport { createQuery } from "@tanstack/svelte-query";\nconst healthCheck = createQuery(orpc.healthCheck.queryOptions());\n{{/if}}\n\nconst TITLE_TEXT = \`\n   ██████╗ ███████╗████████╗████████╗███████╗██████╗\n   ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n   ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n   ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n   ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n   ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n\n   ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗\n   ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝\n      ██║       ███████╗   ██║   ███████║██║     █████╔╝\n      ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗\n      ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗\n      ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\n   \`;\n</script>\n\n<div class="container mx-auto max-w-3xl px-4 py-2">\n	<pre class="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>\n	<div class="grid gap-6">\n	    {{#if (eq api "orpc")}}\n		<section class="rounded-lg border p-4">\n			<h2 class="mb-2 font-medium">API Status</h2>\n			<div class="flex items-center gap-2">\n				<div\n					class={\`h-2 w-2 rounded-full \${$healthCheck.data ? "bg-green-500" : "bg-red-500"}\`}\n				></div>\n				<span class="text-muted-foreground text-sm">\n					{$healthCheck.isLoading\n						? "Checking..."\n						: $healthCheck.data\n							? "Connected"\n							: "Disconnected"}\n				</span>\n			</div>\n		</section>\n	    {{/if}}\n	</div>\n</div>\n{{/if}}\n`,
        type: "text",
      },
      "frontend/svelte/static/favicon.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "0ba5eb8b0a",
        },
        content: "",
        type: "binary",
        binaryHash: "0ba5eb8b0a",
      },
      "frontend/svelte/svelte.config.js": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "0bf0021bb7",
        },
        content: `import adapter from '@sveltejs/adapter-auto';\nimport { vitePreprocess } from '@sveltejs/vite-plugin-svelte';\n\n/** @type {import('@sveltejs/kit').Config} */\nconst config = {\n	// Consult https://svelte.dev/docs/kit/integrations\n	// for more information about preprocessors\n	preprocess: vitePreprocess(),\n\n	kit: {\n		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.\n		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.\n		// See https://svelte.dev/docs/kit/adapters for more information about adapters.\n		adapter: adapter()\n	}\n};\n\nexport default config;\n`,
        type: "text",
      },
      "frontend/svelte/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "10114908b6",
        },
        content: `{\n	"extends": "./.svelte-kit/tsconfig.json",\n	"compilerOptions": {\n		"allowJs": true,\n		"checkJs": true,\n		"esModuleInterop": true,\n		"forceConsistentCasingInFileNames": true,\n		"resolveJsonModule": true,\n		"skipLibCheck": true,\n		"sourceMap": true,\n		"strict": true,\n		"moduleResolution": "bundler"\n	},\n      {{#unless (or (eq backend "convex") (eq backend "none"))}}\n  "references": [{\n    "path": "../server"\n  }]\n  {{/unless}}\n	// Path aliases are handled by https://svelte.dev/docs/kit/configuration#alias\n	// except $lib which is handled by https://svelte.dev/docs/kit/configuration#files\n	//\n	// If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes\n	// from the referenced tsconfig.json - TypeScript does not merge them in\n}\n`,
        type: "text",
      },
      "frontend/svelte/vite.config.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "874cbee5c1",
        },
        content: `import tailwindcss from '@tailwindcss/vite';\nimport { sveltekit } from '@sveltejs/kit/vite';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n	plugins: [tailwindcss(), sveltekit()]\n});\n`,
        type: "text",
      },
      "frontend/svelte/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "afdf92b6fc",
        },
        content: `node_modules\n\n# Output\n.output\n.vercel\n.netlify\n.wrangler\n/.svelte-kit\n/build\n\n# OS\n.DS_Store\nThumbs.db\n\n# Env\n.env\n.env.*\n!.env.example\n!.env.test\n\n# Vite\nvite.config.js.timestamp-*\nvite.config.ts.timestamp-*\n`,
        type: "text",
      },
      "frontend/svelte/_npmrc": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "1e3ad6871d",
        },
        content: `engine-strict=true\n`,
        type: "text",
      },
    },
  },
};
