import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import Lottie from 'lottie-react-native'

import Colors from '../../assets/styles/colors';
import GlobalStyle from '../../assets/styles/global.style'
import BottomNavigator from '../../components/bottom.navigator'

import Fitness from '../../assets/drawables/fitness.json'
import Office from '../../assets/drawables/office.json'
import About from '../../assets/drawables/about.json'
import Workouts from '../../assets/drawables/workout.json'

const HomeScreen = ({route, navigation}) => {

    const GoFitnessExercises = () => {
        navigation.push('ExerciseList', { type: 'fitness' })
    }
    const GoOfficeExercises = () => {
        navigation.push('ExerciseList', { type: 'office' })
    }
    const GoWorkouts = () => {
        navigation.push('Workouts', { type: 'my.workouts' })
    }


    return (
        <View style={[GlobalStyle.container, GlobalStyle.flex('column', 'center', 'space-around'), { paddingBottom: 70 }]}>
            <TouchableOpacity onPress={GoFitnessExercises} style={[GlobalStyle.round, GlobalStyle.flex('row', 'center', 'center'), GlobalStyle.BoxShadow, Styles.item]}>
                <Lottie source={Fitness} autoPlay loop style={[Styles.lottieItem]} />
                <Text style={[GlobalStyle.round, GlobalStyle.ManjariBold, GlobalStyle.label, Styles.label]}>Fitness</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={GoOfficeExercises} style={[GlobalStyle.round, GlobalStyle.flex('row', 'center', 'center'), GlobalStyle.BoxShadow, Styles.item]}>
                <Lottie source={Office} autoPlay loop style={[Styles.lottieItem]} />
                <Text style={[GlobalStyle.round, GlobalStyle.ManjariBold, GlobalStyle.label, Styles.label]}>Office</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={GoWorkouts} style={[GlobalStyle.round, GlobalStyle.flex('row', 'center', 'center'), GlobalStyle.BoxShadow, Styles.item]}>
                <Lottie source={Workouts} autoPlay loop style={[Styles.lottieItem]} />
                <Text style={[GlobalStyle.round, GlobalStyle.ManjariBold, GlobalStyle.label, Styles.label]}>Workouts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[GlobalStyle.round, GlobalStyle.flex('row', 'center', 'center'), GlobalStyle.BoxShadow, Styles.item]}>
                <Lottie source={About} autoPlay loop style={[Styles.lottieItem]} />
                <Text style={[GlobalStyle.round, GlobalStyle.ManjariBold, GlobalStyle.label, Styles.label]}>About Air8</Text>
            </TouchableOpacity>
            <BottomNavigator route={route} navigation={navigation} />
        </View>
    )
}

const Styles = new StyleSheet.create({
    item: {
        width: GlobalStyle.SCREEN_WIDTH * 0.8,
        backgroundColor: 'white',
        position: 'relative',
    },
    label: {
        position: 'absolute',
        left: 20,
        top: -10,
        color: Colors.DarkGreen,
        backgroundColor: Colors.MainGreen,
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 20
    },
    lottieItem: {
        height: GlobalStyle.SCREEN_HEIGHT / 6.5
    }
});

export default HomeScreen;