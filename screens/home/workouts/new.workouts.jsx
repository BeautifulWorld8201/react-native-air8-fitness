import {useState, useEffect, useCallback, useRef, useMemo} from 'react'
import {Animated, View, Text, TouchableOpacity, StyleSheet, Image, Easing, Platform} from 'react-native'
import LottieView from 'lottie-react-native'
import SortableList from 'react-native-sortable-list';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import { MaterialIcons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist' 

import useStoreWorkouts from '../../../hooks/useStoreWorkouts';
import WorkoutExerciseItem from '../../../components/workout.exercise';
import BreakTimer from '../../../components/break.timer'
import EditText from '../../../components/edittext'
import GlobalStyle from '../../../assets/styles/global.style'
import Colors from '../../../assets/styles/colors'
import Alarm from '../../../assets/drawables/alarm.json'
import { ScrollView } from 'react-native-gesture-handler';
import Loading from '../../../components/loading';

import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;

const NewWorkoutScreen = ({params, navigation, onClose}) => {
  const [workouts, setWorkouts] = useState([])
  const [scrollenabled, setScrollenabled] = useState(true);
  const [fitnessCount, setFitnessCount] = useState(0)
  const [officeCount, setOfficeCount] = useState(0)
  const [fitnessTime, setFitnessTime] = useState(0)
  const [officeTime, setOfficeTime] = useState(0)
  const [breakTime, setBreakTime] = useState(0)
  const [workoutName, setWorkoutName] = useState('');
  const [response, storeWorkouts] = useStoreWorkouts();
  const [order, setOrder] = useState([])
  const _sortableRef = useRef()
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false);

  const onAddExercises = () => {
    navigation.push('ExerciseList', {
        type: 'fitness',
        method: 'get',
        selectedData: workouts,
        callback: callback
    })
  }

  useEffect(() =>{
    updateTimerValue(workouts)
  }, [workouts])

  const updateTimerValue = (_workouts) => {
    let fitness = 0, office = 0;
    let time_fitness = 0, time_office = 0, time_break = 0;
    _workouts.map((item, index, array) => {
      if(Object.keys(item).length > 0) {
        if(item.data.type === 'fitness') fitness++, time_fitness += item.workoutTime
        else office++, time_office += item.workoutTime
        time_break += item.breakTime
      }
    })
    setFitnessCount(fitness)
    setOfficeCount(office)

    setFitnessTime(time_fitness)
    setOfficeTime(time_office)
    setBreakTime(time_break)
  }
  const callback = (data) => {
    for(let i = 0 ; i < data.length ; i++) data[i].key = `item-${i}`
    setWorkouts(data) 
  }
  useEffect(() => {
    if(!flag && params.data !== undefined) {
      for(let i = 0 ; i < params.data.length ; i++) params.data[i].key = `item-${i}`
      
      setWorkouts(params.data);
      setFlag(true);
    }
  }, [])
  const onChangeBreakTimer = (uid, timer) => {
    let t = workouts;
    let pos = t.findIndex((item, index, array) => item.uid === uid);
    if(pos !== -1) {
      t[pos].breakTime = timer;
      updateTimerValue(t)
      setWorkouts(t)
    }
  }
  const onChangeWorkoutTimer = (uid, timer)=> {
    let t = workouts;
    let pos = t.findIndex((item, index, array) => item.uid === uid);
    if(pos !== -1) {
      t[pos].workoutTime = timer;
      updateTimerValue(t)
      setWorkouts(t)
    }
  }
  const onRemoveExercise = (uid) => {
    setWorkouts(array => {
      let t = array.filter((item, index, array) => item.uid !== uid)
      updateTimerValue(t)
      return t;
    });
  }

  const renderItem = ({ item, drag, isActive, getIndex }) => {
    const data = item, index = getIndex();
    
    let workoutTimeType = 1;
    if(data.workoutTime === 30) workoutTimeType = 1;
    if(data.workoutTime === 60) workoutTimeType = 2;
    if(data.workoutTime === 90) workoutTimeType = 3;

    let breakTimeType = 1;
    if(data.breakTime === 10) breakTimeType = 1;
    if(data.breakTime === 30) breakTimeType = 2;
    if(data.breakTime === 60) breakTimeType = 3;

    if((index + 1) % 4 !== 0) {
      breakTimeType = 0;
      onChangeBreakTimer(data.uid, 0)
    }

    return (
      <ScaleDecorator>
        <TouchableOpacity onLongPress={drag} disabled={isActive} style={[{width: '100%'}, GlobalStyle.flex('column', 'center', 'flex-start')]}>
          {/* <Row type={params.type} index={index} data={data} active={active} onChangeWorkoutTimer={onChangeWorkoutTimer} onChangeBreakTimer={onChangeBreakTimer} onRemoveExercise={onRemoveExercise} /> */}
          <WorkoutExerciseItem onRemoveExercise={(uid) => onRemoveExercise(uid)} data={data.data} time1={30} time2={60} time3={90} timerType={workoutTimeType} onChangeTimer={(uid, timer) => onChangeWorkoutTimer(uid, timer)} type={workoutTimeType} uid={data.uid} category={data.category} />
          { breakTimeType !== 0 && (<BreakTimer uid={data.uid} title={`Break\nTime`} onChangeTimer={(uid, timer) => onChangeBreakTimer(uid, timer)} timerType={breakTimeType} time1={10} time2={30} time3={60} containerStyle={{width: '90%'}} />) }
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const saveNewWorkouts = () => {
    let t = workouts;
    for(let i = 0; i < t.length ; i++) {
      if((i + 1) % 4 !== 0) t[i].breakTime = 0;
    }
    if(workoutName === '') {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Input Data', textBody: 'Please Enter Your New Workout Name' })
    } else if(workouts.length < 2) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Input Data', textBody: 'Please add more than 3 exercises.' })
    } else {
      let uids = [], break_times = [], workout_times = [], types = [];
      t.map((item, index, array) => {
        if(item != 0) {
          uids.push(item.uid);
          types.push(item.data.type);
          break_times.push(item.breakTime);
          workout_times.push(item.workoutTime);
        }
      })
      setLoading(true);
      storeWorkouts('new.workouts', {
        uids: uids,
        types: types,
        break_times: break_times,
        workout_times: workout_times
      }, workoutName).then(result => {
        if(result === 'exist') {
          setLoading(false);
          Toast.show({ type: ALERT_TYPE.WARNING, title: 'Warning Occured', textBody: 'The Workouts Name Already Exists.' })
        } else if(result === 'success') {
          setLoading(false);
          Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Congratulations!', textBody: 'Your Workouts Successfully Added.' })
          setTimeout(() => {
            navigation.replace('Workouts', { type: 'my.workouts' })
          }, 1000)
        }
      }).catch(error => {
        if(error === 'failed') {
          setLoading(false);
          Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error Occured', textBody: 'Please Check Your Network Connection.' })
        }
      })
    }
  }
  const updateNewWorkouts = () => {
    if(workouts.length < 2) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Input Data', textBody: 'Please add more than 3 exercises.' })
    } else {
      let uids = [], break_times = [], workout_times = [], types = [];
      workouts.map((item, index, array) => {
        uids.push(item.uid);
        types.push(item.data.type);
        break_times.push(item.breakTime);
        workout_times.push(item.workoutTime);
      })
      setLoading(true);
      storeWorkouts(params.type, {
        uids: uids,
        types: types,
        break_times: break_times,
        workout_times: workout_times
      }, params.name).then(result => {
        if(result === 'exist') {
          setLoading(false);
          Toast.show({ type: ALERT_TYPE.WARNING, title: 'Warning Occured', textBody: 'The Workouts Name Already Exists.' })
        } else if(result === 'success') {
          setLoading(false);
          Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Congratulations!', textBody: 'Your Workouts Successfully Updated.' })
          setTimeout(() => {
            navigation.replace('Workouts', { type: 'my.workouts' })
          }, 1000)
        }
      }).catch(error => {
        if(error === 'failed') {
          setLoading(false);
          Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error Occured', textBody: 'Please Check Your Network Connection.' })
        }
      })
    }
  }
  const str_pad_left = (string, pad, length) => {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }

  return (
    <View style={[Styles.container, GlobalStyle.flex('column', 'center', 'flex-start')]}>
      {params.type === 'edit.workouts' && (
        <View style={{width: '100%', alignItems: 'flex-end'}}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors.DarkGreen} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView scrollEnabled={scrollenabled} contentContainerStyle={[{paddingTop: 15}]} style={{width: GlobalStyle.SCREEN_WIDTH}}>
        <View style={[GlobalStyle.BoxShadow, GlobalStyle.round, Styles.panel]}>
          <EditText editable={params.type === 'edit.workouts' ? false : true} value={params.type === 'edit.workouts' ? params.name : workoutName} onChange={(e) => setWorkoutName(e)} placeholder="Enter Your New Workout Name" />
          <View style={[GlobalStyle.flex('row', 'space-around', 'center')]}>
              <View style={{flexGrow: 0.7}}>
                  <View style={[GlobalStyle.flex('row', 'space-between', 'center')]}>
                      <Text style={[GlobalStyle.Manjari, Styles.label]}>{fitnessCount} Fitness Exercises</Text>
                      <Text style={[GlobalStyle.ManjariBold, Styles.label]}>{str_pad_left(Math.floor(fitnessTime / 60), '0', 2) + ':' + str_pad_left(fitnessTime % 60, '0', 2)}</Text>
                  </View>
                  <View style={[GlobalStyle.flex('row', 'space-between', 'center')]}>
                      <Text style={[GlobalStyle.Manjari, Styles.label]}>{officeCount} Office Exercises</Text>
                      <Text style={[GlobalStyle.ManjariBold, Styles.label]}>{str_pad_left(Math.floor(officeTime / 60), '0', 2) + ':' + str_pad_left(officeTime % 60, '0', 2)}</Text>
                  </View>
              </View>
              <View style={[GlobalStyle.flex('row', 'center', 'center'), {flexGrow: 0.3}]}>
                  <LottieView source={Alarm} style={{width: 80}} autoPlay loop />
                  <Text style={[GlobalStyle.ManjariBold, Styles.label]}>{str_pad_left(Math.floor((fitnessTime + officeTime + breakTime) / 60), '0', 2) + ':' + str_pad_left((fitnessTime + officeTime + breakTime) % 60, '0', 2)}</Text>
              </View>
          </View>
          {params.type === 'edit.workouts' && (
            <TouchableOpacity onPress={updateNewWorkouts} style={[Styles.saveButton, GlobalStyle.round, GlobalStyle.BoxShadow]}>
              <Text style={[GlobalStyle.Manjari, Styles.label1]}>Update Workouts</Text>
            </TouchableOpacity>
          )}
          {params.type !== 'edit.workouts' && (
            <TouchableOpacity onPress={saveNewWorkouts} style={[Styles.saveButton, GlobalStyle.round, GlobalStyle.BoxShadow]}>
              <Text style={[GlobalStyle.Manjari, Styles.label1]}>Save New Workouts</Text>
            </TouchableOpacity>
          )}
          
        </View>

        <DraggableFlatList
          data={workouts}
          ref={_sortableRef}
          onDragEnd={({ data }) => setWorkouts(data)}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 50}}
          style={[Styles.list]}
        />
        
      </ScrollView>

      <TouchableOpacity onPress={onAddExercises} style={[Styles.addButton, GlobalStyle.round, GlobalStyle.BoxShadow]}>
          <Text style={[GlobalStyle.Manjari, Styles.buttonLabel]}>Add Exercises</Text>
      </TouchableOpacity>
      <Loading loading={loading} />
    </View>
  )
}

const Styles = new StyleSheet.create({
  container: {
    width: GlobalStyle.SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: GlobalStyle.SCREEN_WIDTH * 0.05,
  },
  addButton: {
    position: 'absolute',
    bottom: 10 + statusBarHeight,
    backgroundColor: Colors.MainGreen,
    width: GlobalStyle.SCREEN_WIDTH / 2,
    paddingVertical: 8
  },
  buttonLabel: {
    textAlign: 'center',
    width: '100%',
    fontSize: GlobalStyle.SCREEN_WIDTH / 30,
    color: 'white'
  },
  panel: {
    width: '90%',
    paddingHorizontal: 10,
    marginHorizontal: '5%',
    paddingVertical: 10,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  label: {
    fontSize: GlobalStyle.SCREEN_WIDTH / 30,
  },
  saveButton: {
    backgroundColor: Colors.MainGreen,
    width: '100%',
    paddingVertical: 8
  },
  label1: {
    textAlign: 'center',
    width: '100%',
    fontSize: GlobalStyle.SCREEN_WIDTH / 30,
    color: 'white'
  },
  list: {
    marginTop: 10,
    width: '100%',
    height: GlobalStyle.SCREEN_HEIGHT / 1.8
  },
  
})

export default NewWorkoutScreen