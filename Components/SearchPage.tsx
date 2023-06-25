import {View,TouchableOpacity,Text,Animated,Easing,Keyboard,Dimensions} from 'react-native'
import { KeyboardAwareScrollView } from '../FixedPatchPackage/react-native-keyboard-aware-scroll-view'
import {useState,useEffect,useRef} from 'react'
import { TextInput } from 'react-native-paper'
const SearchPage = ({navigation}) => {
    const [search,setSearch] = useState("")
    const [loading,setLoading] = useState(false)
    const [errorShown,setErrorShown] = useState("")



    const searchPokemon = async () => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`)
        .then((response) => {
            if(response.status==200){
                return response.json()
            }else {
                throw "Pokemon Not Found"; 
            }
        })
        .then((data) => {
            setLoading(false)
            setSearch("")
            navigation.navigate("Details",{data:data})
        })
        .catch((error) => {
            setErrorShown(error)
            setLoading(false)
        });
    }
    const pokeBall = new Animated.Value(0)

    useEffect(()=>{
        if(loading!=null && loading==true){
            Animated.loop(
                Animated.timing(pokeBall, {
                    toValue: 1,
                    duration: 1000, 
                    easing: Easing.linear,
                    useNativeDriver: true,
                  })
            ).start()
        }
        if(loading!=null && loading==false){
            Animated.sequence([
                Animated.timing(pokeBall, {
                  toValue: 1,
                  duration: 1000,
                  easing: Easing.linear,
                  useNativeDriver: true,
                })
              ]).start();
        }
    },[loading])

    const rotateInterpolation = pokeBall.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });

    const errorHolder = useRef(new Animated.Value(-100)).current

    useEffect(()=>{
        if(errorShown!="" && errorShown!=null){
            Animated.sequence(
                [Animated.timing(errorHolder,{
                    duration:150,
                    useNativeDriver:false,
                    easing: Easing.ease,
                    toValue:85
                }),
                Animated.timing(errorHolder,{
                    delay:2000,
                    duration:150,
                    useNativeDriver:false,
                    easing: Easing.ease,
                    toValue:-100
                })]
            ).start(()=>{setErrorShown("")})
        }
    },[errorShown])
    return(
            <KeyboardAwareScrollView enableOnAndroid={true}  contentContainerStyle={{alignItems:'center',backgroundColor:'#2d3151',flexGrow:1}}>
            <Animated.View style={{position:'absolute',zIndex:10,height:60,width:300,backgroundColor:'#f3eae8',borderRadius:10,justifyContent:'center',alignItems:'center',top:errorHolder}}>
                <View style={{width:"96%",height:"90%",borderWidth:5,borderColor:"#2d3151",justifyContent:'center',alignItems:'center',borderRadius:10}}>
                <Text style={{color:"#2d3151",fontWeight:"600",fontSize:20}}>{errorShown}</Text>
                </View>
            </Animated.View>
            <View style={{height:50,marginVertical:10,width:"100%",justifyContent:'center',alignItems:'flex-end'}}>
                <TouchableOpacity onPress={()=>{navigation.navigate("Bookmarks")}} style={{backgroundColor:"#f6b815",width:"30%",height:"80%",justifyContent:'center',alignItems:'center',borderTopLeftRadius:10,borderBottomLeftRadius:10,elevation:10}}><Text style={{color:"#2d3151",fontWeight:"800",}}>My Bookmarks</Text></TouchableOpacity>
            </View>
            <View style={{width:"90%",backgroundColor:'transparent'}}>
                <Text style={{fontSize:20,color:"white",marginTop:"-5%",fontWeight:'600'}}>Welcome to</Text>
                <Text style={{fontSize:44,color:'#f6b815',fontWeight:"600",marginTop:5,marginBottom:10}}>Pokedex</Text>
                <View style={{width:"100%",justifyContent:'center',alignItems:'center',paddingVertical:30}}>
                <Animated.Image source={require("./Helpers/pokeball.png")} style={{backgroundColor:'transparent',width:300,height:300,transform:[{rotate:rotateInterpolation}]}}/>
                </View>
            </View>
            <View style={{width:"100%",justifyContent:'center',alignItems:'center',backgroundColor:'transparent'}}>
            <TextInput 
            value={search}
            onChangeText={(value)=>setSearch(value)}
            mode='outlined'
            placeholder='Enter Pokemon Name Here'
            style={{backgroundColor:'#2d3151',width:"90%",paddingLeft:8,height:60}}
            contentStyle={{color:'white',fontSize:16}}
            outlineStyle={{borderRadius:10}}
            activeOutlineColor='white'
            outlineColor='white'
            placeholderTextColor={"rgba(255,255,255,0.4)"}
            />
            <TouchableOpacity onPress={()=>{if(search!=""){setLoading(true);searchPokemon()}}} style={{marginVertical:20,backgroundColor:'#f6b815',width:"90%",justifyContent:'center',alignItems:'center',borderRadius:8,elevation:10,height:60}}>
                <Text style={{color:'#2d3151',paddingVertical:10,paddingHorizontal:30,fontSize:22,fontWeight:"800"}}>Search for Pokemon!</Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row',width:"90%",alignItems:'center',marginVertical:5,justifyContent:'center'}}>
                <View style={{width:"35%",height:1.5,backgroundColor:'white',borderRadius:10}}></View>
                <Text style={{width:"10%",textAlign:'center',fontWeight:"600",color:'white'}}>OR</Text>
                <View style={{width:"35%",height:1.5,backgroundColor:'white',borderRadius:10}}></View>
            </View>
            <TouchableOpacity onPress={()=>{navigation.navigate("Listing")}} style={{marginVertical:20,backgroundColor:'#f6b815',width:"90%",justifyContent:'center',alignItems:'center',borderRadius:8,elevation:10,height:60}}>
                <Text style={{color:'#2d3151',paddingVertical:10,paddingHorizontal:30,fontSize:22,fontWeight:"800"}}>Search All!</Text>
            </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    )
}
export default SearchPage