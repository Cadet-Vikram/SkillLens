import { AppRegistry } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

AppRegistry.registerComponent("main", () => App);

export default App;
