import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { HomePage } from "./components/pages/HomePage";
import { GeneralInfoPage } from "./components/pages/GeneralInfoPage";
import { VolunteerMatchingPage } from "./components/pages/VolunteerMatchingPage";
import { EventsPage } from "./components/pages/EventsPage";
import { HealthServicesPage } from "./components/pages/HealthServicesPage";

export type Page =
  | "home"
  | "info"
  | "volunteer"
  | "events"
  | "health";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleVoiceCommand = (command: string) => {
    setSearchQuery(command);

    // Route based on command
    if (
      command.toLowerCase().includes("volunteer") ||
      command.toLowerCase().includes("help")
    ) {
      setCurrentPage("volunteer");
    } else if (
      command.toLowerCase().includes("event") ||
      command.toLowerCase().includes("activity")
    ) {
      setCurrentPage("events");
    } else if (
      command.toLowerCase().includes("health") ||
      command.toLowerCase().includes("hospital") ||
      command.toLowerCase().includes("doctor")
    ) {
      setCurrentPage("health");
    } else {
      setCurrentPage("info");
    }
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const goHome = () => {
    setCurrentPage("home");
    setSearchQuery("");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.phoneFrame}>
          {/* Page Content */}
          <View style={styles.content}>
            {currentPage === "home" && (
              <HomePage
                onNavigate={navigateTo}
                onVoiceCommand={handleVoiceCommand}
              />
            )}
            {currentPage === "info" && (
              <GeneralInfoPage
                query={searchQuery}
                onBack={goHome}
                onVoiceCommand={handleVoiceCommand}
              />
            )}
            {currentPage === "volunteer" && (
              <VolunteerMatchingPage
                onBack={goHome}
                onVoiceCommand={handleVoiceCommand}
              />
            )}
            {currentPage === "events" && (
              <EventsPage
                onBack={goHome}
                onVoiceCommand={handleVoiceCommand}
              />
            )}
            {currentPage === "health" && (
              <HealthServicesPage
                onBack={goHome}
                onNavigate={navigateTo}
                onVoiceCommand={handleVoiceCommand}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneFrame: {
    width: "100%",
    maxWidth: 430,
    height: "100%",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderRadius: 24,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
});