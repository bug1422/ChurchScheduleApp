import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Church,
  ChurchTime,
  ChurchDay,
  GetChurches,
} from "@/mock_data/churches";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { IncludeUnicodeText } from "@/utils/stringCompare";



const getClosestChurchTime = (churchTime: ChurchTime[]): {hour: number,minute: number} | undefined => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  console.log(`${day},${hour},${minute},${second}`);
  const churchToday = churchTime.find((v: ChurchTime) => {
    return ChurchDay[v.Day as keyof typeof ChurchDay] == day;
  });
  if (churchToday !== undefined) {
    const availTimes = churchToday.Time.map((v) => {
      const time = v.split(":");
      return { hour: parseInt(time[0]), minute: parseInt(time[1]) };
    });
    const closestTime = availTimes
      .filter((v) => {
        return v.hour == hour ? v.minute > minute : v.hour > hour;
      })
      .sort((a: any, b: any) => {
        const prevDate = a.split(":");
        const postDate = b.split(":");
        const hourOffset = parseInt(prevDate[0]) - parseInt(postDate[0]);
        return hourOffset == 0
          ? parseInt(prevDate[1]) - parseInt(postDate[1])
          : hourOffset;
      })[0];
      return {
        "hour": closestTime.hour,
        "minute": closestTime.minute,
      }
  } else {
    return undefined;
  }
};

const ChurchItem = ({ item }: { item: ChurchData }) => {
  if (item === undefined) return <></>;

  const getClosestTimeString = () => {
    if (item.ClosestTime !== undefined)
      return `${item.ClosestTime.hour}:${item.ClosestTime.minute}`;
    else return "No schedule";
  };
  return (
    <View style={styles.item}>
      <Image
        style={styles.itemImage}
        source={{
          uri: "https://th.bing.com/th/id/OIP.2lzDQXMx1d9JJbxhe_B8GAHaHa?rs=1&pid=ImgDetMain",
        }}
      />
      <View style={styles.itemTextContainer}>
        <Text style={{ ...styles.itemText, ...styles.itemName }}>
          {item.Name}
        </Text>
        <Text style={{ ...styles.itemText, ...styles.itemAddress }}>
          {item.Address}
        </Text>
        <Text style={{ ...styles.itemText, ...styles.itemTime }}>
          {`Next church hour: `}
          <Text style={{ ...styles.itemText, ...styles.itemName }}>{getClosestTimeString()}</Text>
        </Text>
      </View>
    </View>
  );
};

type ChurchData = {
  Name: string;
  Address: string;
  ClosestTime: { hour: number; minute: number } | undefined;
};

const SearchBar = ({onChange}:{onChange:(text:string)=>void}) => {
  const [text,setText] = useState("")
  const onChangeHook = (text:string) => {
    onChange(text)
    setText(text)
  }
  return (
    <View style={styles.searchBar}>
      <TextInput
      style={styles.itemText}
      onChangeText={onChangeHook}
      value={text}
      placeholder="Search by name"
      />
    </View>
  );
};

const SearchPage = () => {
  const [churches, setChurches] = useState<ChurchData[]>([]);
  const [sorted,setSorted] = useState<ChurchData[]>([])
  useEffect(() => {
    const churches = GetChurches()
      .map((v): ChurchData => {
        return {
          Name: v.Name,
          Address: v.Address,
          ClosestTime: getClosestChurchTime(v.Schedule),
        };
      })
      .sort((a:ChurchData,b:ChurchData) => {
        if(a.ClosestTime === undefined)
          return 1
        else if(b.ClosestTime === undefined)
          return -1
        else
        return a.ClosestTime.hour == b.ClosestTime.hour ? a.ClosestTime.minute - b.ClosestTime.minute : a.ClosestTime.hour - b.ClosestTime.hour
      });
    setChurches(churches);
    setSorted(churches)
  }, []);

  const onChangeSearchValue = (text:string) => {
    setSorted(churches.filter((church:ChurchData) => {
      return IncludeUnicodeText(church.Name.toLowerCase(),text.toLowerCase())
    }))
  }
  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <SearchBar onChange={onChangeSearchValue} />
        <FlatList
          data={sorted}
          renderItem={({ item }) => <ChurchItem item={item} />}
          keyExtractor={(item) => item.Name}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    height: 60,
    backgroundColor: "#6200EE",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    resizeMode: "stretch",
    marginRight: 14,
    borderRadius: 8,
  },
  itemTextContainer: {
    display: "flex",
    flexDirection: "column",
  },
  itemText: {
    fontSize: 14,
  },
  itemName: {
    fontWeight: 500,
  },
  itemAddress: {},
  itemTime: {},
});
export default SearchPage;
