import { ChurchDay } from "@/mock_data/churches";
import {
  ChurchEvent,
  getEventsByDay,
  getEvents,
  getHighPriorityEvent,
} from "@/mock_data/events";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

type MarkDateProps = {
  [key: string]: {
    selected: boolean;
    marked: boolean;
    selectedColor: string;
  };
};
const EventHeader = () => {
  const [today, setToday] = useState(new Date());
  const todayEvents = getEventsByDay(today.toISOString().split("T")[0]);

  useEffect(()=>{
    setInterval(()=>{
      setToday(new Date())
    }, 1000)
    
  }, [])

  return(
    <View style={styles.eventHeaderContainer}>
      <Text style={styles.eventHeaderDateLabel}>{`${ChurchDay[today.getDay()]} - ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`}</Text>
      {
        todayEvents.length > 0 && 
        <Text>test</Text>
      }
    </View>
  )
}

const EventFooter = ({ events }: { events: ChurchEvent[] }) => {
  if(events.length > 0)
    return (
  <>
   <View style={styles.eventFooterContainer}>
      <Image style={styles.eventImage} source={{ uri: events[0].image }} />
      <View style={styles.itemTextContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ ...styles.eventLabel }}
        >
          {events[0].title}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ ...styles.eventLabel }}
        >
          {events[0].description}
        </Text>
      </View>
    </View>
    {events.length > 1 && <Text style={{textAlign: "center", fontSize: 10, fontWeight: 200}}>Show more {events.length - 1}</Text>}
  </>
    )
  else
    return <></>
};

const CalendarView = () => {
  const [selectedEvents, setSelectedEvents] = useState<ChurchEvent[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [markedDates, setMarkedDate] = useState<MarkDateProps>({});

  useEffect(() => {
    const events = getHighPriorityEvent();
    events.forEach((event: ChurchEvent) => {
      setMarkedDate((prev) => ({
        ...prev,
        [event.date]: {
          selected: true,
          marked: true,
          selectedColor: "red",
        },
      }));
    });
    console.log(markedDates);
  }, []);

  useEffect(() => {
    setSelectedEvents(getEventsByDay(selected));
  }, [selected]);

  return (
    <View style={styles.mainContainer}>
      <EventHeader />
      <View style={styles.calendarContainer}>
        <Calendar
          theme={{
            arrowColor: "#6200EE",
            todayTextColor: "white",
            todayBackgroundColor: "#6200EE",
          }}
          onDayPress={(day: any) => {
            setSelected(day.dateString);
          }}
          current={new Date().toString()}
          markedDates={{
            ...markedDates,
            [selected]: {
              selected: true,
              disableTouchEvent: true,
              selectedDotColor: "orange",
            },
          }}
        />
      </View>
      <EventFooter events={selectedEvents} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 8,
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  eventHeaderContainer: {

  },
  eventHeaderDateLabel: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  eventFooterContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 8,
    marginHorizontal: 16,
    overflowX: "hidden",
  },
  eventImage: {
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
  eventLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 16,
  },
  calendarContainer: {
    padding: 16,
    width: "100%",
  },
});

export default CalendarView;
