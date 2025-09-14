import type React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"

import DashboardScreen from "../screens/main/DashboardScreen"
import PiketScreen from "../screens/main/PiketScreen"
import PelajaranScreen from "../screens/main/PelajaranScreen"
import TaskScreen from "../screens/main/TaskScreen"
import ProfileScreen from "../screens/main/ProfileScreen"

export type MainTabParamList = {
  Dashboard: undefined
  Piket: undefined
  Pelajaran: undefined
  Task: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

const MainNavigator: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Piket") {
            iconName = focused ? "calendar" : "calendar-outline"
          } else if (route.name === "Pelajaran") {
            iconName = focused ? "book" : "book-outline"
          } else if (route.name === "Task") {
            iconName = focused ? "clipboard" : "clipboard-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          } else {
            iconName = "help-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t("navigation.dashboard"),
        }}
      />
      <Tab.Screen
        name="Piket"
        component={PiketScreen}
        options={{
          tabBarLabel: t("navigation.piket"),
        }}
      />
      <Tab.Screen
        name="Pelajaran"
        component={PelajaranScreen}
        options={{
          tabBarLabel: t("navigation.pelajaran"),
        }}
      />
      <Tab.Screen
        name="Task"
        component={TaskScreen}
        options={{
          tabBarLabel: "Tugas",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t("navigation.profile"),
        }}
      />
    </Tab.Navigator>
  )
}

export default MainNavigator
