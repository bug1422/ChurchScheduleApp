import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  Dimensions,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Church,
  ChurchTime,
  ChurchDay,
  GetChurches,
} from "@/mock_data/churches";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Tag from "@/components/Tag";
import { IncludeUnicodeText } from "@/utils/stringCompare";
import { Picker } from "@react-native-picker/picker";
import { SearchBar } from "@rneui/themed";

const now = new Date();
const day = now.getDay();
const hour = now.getHours();
const minute = now.getMinutes();
//test
// const hour = 5;
// const minute = 1;
type ChurchTimeData = {
  day: string;
  times: ChurchTimeInfo[];
};
type ChurchTimeInfo = { hour: number; minute: number };
type ChurchInfo = {
  name: string;
  address: string;
};
type ChurchWeeklyData = ChurchInfo & {
  timeDatas: ChurchTimeData[];
};
type ChurchDailyData = ChurchInfo & {
  closestTimeIndex: number;
  timeData: ChurchTimeData | undefined;
};

type SearchOptionProp<T> = {
  children: any;
  items: T[];
  selectedIndex: number;
  onChange: (idx: number) => void;
};

const ChurchItem = ({ item }: { item: ChurchDailyData }) => {
  if (item === undefined) return <></>;
  const getTimeString = (time: ChurchTimeInfo) => {
    return `${time.hour}:${time.minute}`;
  };

  const ChurchTimeline = () => {
    if (item.timeData === undefined) return <Text>No time found</Text>;

    let times = item.timeData.times;
    if (item.closestTimeIndex != 0)
      times = item.timeData?.times
        .slice(item.closestTimeIndex - 1)
        .concat(item.timeData.times.slice(0));

    return times.map((v: ChurchTimeInfo, i: number) => {
      let color = "grey";
      if (i === item.closestTimeIndex) color = "green";
      else if (v.hour >= hour) {
        if (v.minute > minute) {
          color = "blue";
        }
      }
      return (
        <Tag color={color} key={i}>
          {getTimeString(v)}
        </Tag>
      );
    });
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
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ ...styles.itemText, ...styles.itemName }}
        >
          {item.name}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ ...styles.itemText, ...styles.itemAddress }}
        >
          {item.address}
        </Text>
        <Text style={{ ...styles.itemText, ...styles.itemTime }}>
          {`Next church hour: `}
          <ChurchTimeline />
        </Text>
      </View>
    </View>
  );
};

const SearchOption = ({
  children,
  items,
  selectedIndex,
  onChange,
}: SearchOptionProp<string>) => {
  return (
    <View style={styles.searchOptionContainer}>
      <Text style={styles.searchOptionLabel}>{children}</Text>
      <Picker
        style={styles.searchOption}
        selectedValue={items[selectedIndex]}
        onValueChange={(value: any, idx: number) => {
          onChange(idx);
        }}
      >
        {items.map((v: string, idx: number) => (
          <Picker.Item label={v} value={v} key={idx} />
        ))}
      </Picker>
    </View>
  );
};

const SearchPage = () => {
  const [text, setText] = useState("");
  const [churchesDatas, setChurchesDatas] = useState<ChurchWeeklyData[]>([]);
  const [sorted, setSorted] = useState<ChurchDailyData[]>([]);
  const [dayIndex, setDayIndex] = useState<number>(day);
  const [hourIndex, setHourIndex] = useState<number>(hour);
  const [minuteIndex, setMinuteIndex] = useState<number>(minute);

  const GetChurchesData = () => {
    const churchesDatas: ChurchWeeklyData[] = GetChurches().map(
      (church: Church): ChurchWeeklyData => {
        return {
          name: church.Name,
          address: church.Address,
          timeDatas: church.Schedule.map(
            (churchTime: ChurchTime): ChurchTimeData => {
              let availTimes = churchTime.Time.map((v) => {
                const time = v.split(":");
                return { hour: parseInt(time[0]), minute: parseInt(time[1]) };
              }).sort((a, b) => {
                return a.hour == b.hour ? a.minute - b.minute : a.hour - b.hour;
              });
              return {
                day: churchTime.Day,
                times: availTimes,
              };
            }
          ),
        };
      }
    );
    setChurchesDatas(churchesDatas);
  };

  const updateSorted = () => {
    const sorted = churchesDatas
      .filter((v: ChurchWeeklyData) => {
        return IncludeUnicodeText(v.name.toLowerCase(), text.toLowerCase());
      })
      .map((v: ChurchWeeklyData): ChurchDailyData => {
        const timeData = v.timeDatas.find(
          (p: ChurchTimeData) => p.day == ChurchDay[dayIndex]
        );
        return {
          name: v.name,
          address: v.address,
          closestTimeIndex:
            timeData === undefined
              ? -1
              : timeData.times.findIndex(
                  (v) =>
                    v.hour > hourIndex ||
                    (v.hour == hourIndex && v.minute >= minuteIndex)
                ),
          timeData: timeData,
        };
      });

    setSorted(sorted);
  };

  useEffect(() => {
    GetChurchesData();
  }, []);
  useEffect(() => {
    updateSorted();
  }, [text, dayIndex, hourIndex]);

  const onChangeSearchValue = (text: string) => {
    setText(text);
  };

  const days = Object.keys(ChurchDay).filter((key) => isNaN(Number(key)));
  const hours = Array.from({ length: 24 }, (_, idx) => `${idx}:00`);
  const minutes = Array.from({ length: 60 }, (_, idx) => `${idx}`);
  console.log(days);
  console.log(hours);
  console.log(minutes);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View>
          <SearchBar
            containerStyle={styles.searchBar}
            inputContainerStyle={styles.searchBar}
            placeholder="Search by name"
            value={text}
            onChangeText={onChangeSearchValue}
          />
          <View>
            <SearchOption
              items={days}
              selectedIndex={dayIndex}
              onChange={setDayIndex}
            >
              Day
            </SearchOption>
            <SearchOption
              items={hours}
              selectedIndex={hourIndex}
              onChange={setHourIndex}
            >
              Hour
            </SearchOption>
            <SearchOption
              items={minutes}
              selectedIndex={minuteIndex}
              onChange={setMinuteIndex}
            >
              Minute
            </SearchOption>
          </View>
        </View>
        {sorted.length != 0 ? (
          <FlatList
            data={sorted}
            renderItem={({ item }) => <ChurchItem item={item} />}
            keyExtractor={(item) => item.name}
          />
        ) : (
          <View>
            <Text style={styles.notFound}>No churches found</Text>
          </View>
        )}
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
  searchOptionContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  searchOptionLabel: {},
  searchOption: {
    flex: 1,
  },
  notFound: {
    marginTop: 24,
    fontSize: 18,
    textAlign: "center",
  },
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    paddingBottom: 120,
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
  itemAddress: {
    flex: 1,
    flexWrap: "wrap",
    maxWidth: Dimensions.get("window").width * 0.65,
  },
  itemTime: {},
});
export default SearchPage;
