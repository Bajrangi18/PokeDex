import {SafeAreaView, View,Text} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchPage from './Components/SearchPage';
import ListingPage from './Components/ListingPage';
import DetailsPage from './Components/DetailsPage';
import BookmarkPage from './Components/BookmarkPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState,useEffect} from 'react'

const Stack = createNativeStackNavigator();
const App = () => {
  const [pokemons,setPokemons] = useState<{name:string,data:any}[]>([])
  const [bookmarked,setBookmarked] = useState(false)
  const [callData,setCallData] = useState(false)
  
  const getPokemons = async () => {
    try
    {
      setPokemons([])
      const value = await AsyncStorage.getItem('@Bookmarked_Pokemons');
    if(value!=null){
        for(let val in JSON.parse(value)){
            setPokemons(prev=>[...prev,JSON.parse(value)[val]])
        }
    }else{
        setPokemons([])
    }}
    catch(e){
        console.log("Error Reading")
    }
}
  
  useEffect(()=>{
    getPokemons()
  },[bookmarked,callData])

  return(
    <SafeAreaView style={{height:"100%",width:"100%",backgroundColor:'#2d3151'}}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Search" options={{headerShown:false}}>
            {(props) => <SearchPage {...props} />}
        </Stack.Screen>
        <Stack.Screen name="Listing" options={{headerTransparent:true,headerTitle: ()=> <View/>,headerTintColor:"white"}}>
            {(props) => <ListingPage {...props} />}
        </Stack.Screen>
        <Stack.Screen name="Details" options={{headerTransparent:true,headerTitle: ()=> <View/>,headerTintColor:"white"}}>
            {(props) => <DetailsPage {...props} bookmarked={bookmarked} setBookmarked={setBookmarked} />}
        </Stack.Screen>
        <Stack.Screen name="Bookmarks" options={{headerTransparent:true,headerTitle: ()=> <View><Text style={{fontSize:18,fontWeight:"700"}}>My Bookmarks</Text></View>,headerTintColor:"white"}}>
            {(props) => <BookmarkPage {...props} pokemons={pokemons} setCallData={setCallData} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaView>
  )
}
export default App