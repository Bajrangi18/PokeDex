import {View,Text,Image,ScrollView, TouchableOpacity} from 'react-native'
import {useEffect, useState} from 'react'
import Carousel from 'react-native-snap-carousel'
import AsyncStorage from '@react-native-async-storage/async-storage';


function capitalizeFirstLetter(str:string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
function convertToTitleCase(str:string) {
    const words = str.split('-');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
}


const BookmarkPage = ({navigation,pokemons,setCallData}) => {
    const [bookmarks,setBookmarks] = useState<{name:string,data:any}[]>([])
    useEffect(()=>{
        if(pokemons!=undefined){
            setBookmarks(pokemons)
        }
    },[pokemons])

    useEffect(()=>{return ()=>setCallData(false)},[])

    const deletePokemon = async (pokename:string) => {
        try{
            await AsyncStorage.setItem('@Bookmarked_Pokemons', JSON.stringify(pokemons.filter((poke:{name:string,data:any})=>poke.name!=pokename)));
            setCallData(true)}
        catch(e){
            console.log("Error Deleting")
        }
    }
    const renderItem = ({item}) => {
        return (
          <View style={{justifyContent: 'flex-end', alignItems: 'center',width:300,height:"100%",backgroundColor:'transparent'}}>
            <Image source={{uri:item.data.sprites.other["official-artwork"].front_default}} style={{height:"40%",width:"70%",position:'absolute',top:"0%",zIndex:2}} />
            <View style={{backgroundColor:'rgba(255,255,255,0.1)',height:"78%",borderRadius:30,width:"100%",zIndex:1,alignItems:'center'}}>
                    <Text style={{color:'white',fontSize:30,fontWeight:"800",marginTop:"30%"}}>{capitalizeFirstLetter(item.name)}</Text>
                    <ScrollView horizontal contentContainerStyle={{height:40,backgroundColor:'transparent',alignItems:'center'}}>
                    {item.data.types.map((item, index) => (
                        <View key={index} style={{width:"auto",backgroundColor:"rgba(255,255,255,0.2)",borderRadius:50,height:30,marginHorizontal:5}}>
                        <Text style={{paddingHorizontal:15,paddingVertical:5,fontWeight:'500',color:'white'}}>{convertToTitleCase(item.type.name)}</Text>
                        </View>
                    ))}
                    </ScrollView>
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-evenly',width:"40%"}}>
                        <View><Image source={{uri:"https://img.icons8.com/color/96/like--v3.png"}} style={{height:40,width:40}}/></View>
                        <Text style={{fontSize:25,fontWeight:"800",color:'white'}}>{item.data.stats[0].base_stat}</Text>
                    </View>
                    <View style={{flexDirection:'row',width:"90%",justifyContent:'space-evenly',marginVertical:10}}>
                        <View style={{justifyContent:'center',alignItems:'center'}}><Text style={{fontWeight:"800",fontSize:16}}>Height</Text><Text style={{fontWeight:"600",fontSize:14,color:"#f6b815"}}>{`${Math.floor((item.data.height * 3.937) / 12)}'${((item.data.height * 3.937) % 12).toFixed(2)}"`}</Text></View>
                        <View style={{justifyContent:'center',alignItems:'center'}}><Text style={{fontWeight:"800",fontSize:16}}>Weight</Text><Text style={{fontWeight:"600",fontSize:14,color:"#f6b815",textAlign:'center'}}>{`${(item.data.weight * 0.220462).toFixed(2)} lbs`}</Text></View>
                    </View>
                    <View style={{flexDirection:'row',width:"100%",justifyContent:'space-evenly',marginVertical:10}}>
                        <View style={{justifyContent:'center',alignItems:'center'}}><Text style={{fontWeight:"800",fontSize:16}}>Attack</Text><Text style={{fontWeight:"600",fontSize:14,color:"#f6b815"}}>{item.data.stats[1].base_stat}</Text></View>
                        <View style={{justifyContent:'center',alignItems:'center'}}><Text style={{fontWeight:"800",fontSize:16}}>Defense</Text><Text style={{fontWeight:"600",fontSize:14,color:"#f6b815"}}>{item.data.stats[2].base_stat}</Text></View>
                        <View style={{justifyContent:'center',alignItems:'center'}}><Text style={{fontWeight:"800",fontSize:16}}>Speed</Text><Text style={{fontWeight:"600",fontSize:14,color:"#f6b815"}}>{item.data.stats[5].base_stat}</Text></View>
                    </View>
                    <View style={{height:45}}>
                        <TouchableOpacity onPress={()=>{deletePokemon(item.name)}} style={{backgroundColor:"#f6b815",borderRadius:30}}><Text style={{color:"#2d3151",fontSize:20,fontWeight:"800",paddingVertical:5,paddingHorizontal:30}}>REMOVE</Text></TouchableOpacity>
                    </View>
            </View>
          </View>
        );
    }
    return(
        <View style={{backgroundColor:"#2d3151",justifyContent:'center',alignItems:'center',flex:1,width:"100%"}}>
            <View style={{backgroundColor:'transparent',height:"60%",width:"100%",overflow:'visible'}}>
            {bookmarks.length==0?<View style={{justifyContent:'center',alignItems:'center',height:"100%"}}>
                <Text style={{width:"80%",textAlign:'center',fontSize:18,fontWeight:"500",lineHeight:25}}> You have no Bookmarked Pokemons{"\n"}to bookmark a Pokemon press the bookmark icon on top when viewing a pokemon!</Text>
            </View>:
            <Carousel
              data={bookmarks}
              renderItem={renderItem}
              sliderWidth={400}
              itemWidth={300}
              keyExtractor={(item)=>item.name}
            />}
            </View>
        </View>
    )
}
export default BookmarkPage

