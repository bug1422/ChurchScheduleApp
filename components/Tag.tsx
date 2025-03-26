import { ColorValue, StyleSheet, Text, View } from "react-native"

type TagProps = {
    children: any;
    color: ColorValue;
    props?: { [key:string]: any }
}

const Tag = ({children,color,props}:TagProps) => {
    return (
        <View style={{...styles.tag, backgroundColor: color}} {...props}>
            <Text>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    tag: {
        borderRadius: 8,
        padding: 2,
        paddingHorizontal: 6,
        marginEnd: 4, 
    }
})

export default Tag