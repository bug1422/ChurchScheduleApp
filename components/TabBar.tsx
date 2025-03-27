import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import React from "react";

const TabBar = ({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) => {
  const icons: {
    [key: string]: (props: {
      [key: string]: any;
      size?: number;
      color?: string;
    }) => JSX.Element;
  } = {
    index: (props) => (
      <AntDesign name="home" size={26} color={"#808080"} {...props} />
    ),
    profile: (props) => (
      <AntDesign name="profile" size={26} color={"#808080"} {...props} />
    ),
    settings: (props) => (
      <AntDesign name="setting" size={26} color={"#808080"} {...props} />
    ),
    searchPage: (props) => (
      <Entypo name="magnifying-glass" size={26} color={"#808080"} {...props} />
    ),
  };

  return (
    <View style={styles.tabbar}>
      {state.routes.map(
        (route: { key: string; name: string; params?: any }, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          if (["_sitemap", "+not-found"].includes(route.name)) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.name}
              style={styles.tabbarItem}
              onPress={onPress}
              onLongPress={onLongPress}
            >
              {icons[route.name as keyof typeof icons]({
                color: isFocused ? "#673ab7" : "#222",
              })}
              <View
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
              >
                <Text
                  style={{
                    color: isFocused ? "#673ab7" : "#222",
                    fontSize: 11,
                  }}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 0,
    width: Dimensions.get("window").width,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 15,
    paddingStart: 30,
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopStartRadius: 25,
    borderTopEndRadius: 25,
    borderCurve: "continuous",
  },

  tabbarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});
export default TabBar;
