import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '@/components/TabBar'

const TabLayout = () => {
  return (
    <Tabs   
        tabBar={props => <TabBar {...props} />}
    >
        <Tabs.Screen 
            name="index"
            options={{
                headerShown: false,
                title: "Home"
            }}
        />
        <Tabs.Screen 
            name="profile"
            options={{
                title: "Profile"
            }}
        />
        <Tabs.Screen 
            name="setting"
            options={{
                title: "Settings"
            }}
        />
        <Tabs.Screen
            name='searchPage'
            options={{
                headerShown: false,
                title: "Search Page"
            }}
        />
    </Tabs>
  )
}

export default TabLayout