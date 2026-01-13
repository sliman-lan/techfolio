import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import ProjectDetail from "../pages/ProjectDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CreateProject from "../pages/CreateProject";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="ProjectDetail" component={ProjectDetail} options={{ title: "Project" }} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="CreateProject" component={CreateProject} options={{ title: 'New Project' }} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
