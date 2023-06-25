import {View,Text,Image,Animated,FlatList,TouchableOpacity} from 'react-native'
import {useState,useEffect} from 'react'
import colorcode from "./Helpers/colorcoding.json"
import AsyncStorage from '@react-native-async-storage/async-storage';
import bookmarkOn from './Helpers/bookmark_on.png'
import bookmarkOff from './Helpers/bookmark_off.png'

function capitalizeFirstLetter(str:string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
function convertToTitleCase(str:string) {
    const words = str.split('-');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
}
interface ColorCodes {
    [key: string]: string;
}
const DetailsPage = ({navigation,route,bookmarked,setBookmarked}) => {
    const [data,setData] = useState(route.params.data)
    const [speciesData,setSpeciesData] = useState<any>()
    const [activeIndex, setActiveIndex] = useState(0);
    const barPosition = new Animated.Value(0);
    const [pokemons,setPokemons] = useState<{name:string,data:any}[]>([])
    useEffect(()=>{
        return () => setBookmarked(false)
    },[])
    useEffect(()=>{
        getPokemons()
    },[])

    useEffect(()=>{
        if(pokemons.length!=0){
            for(let val in pokemons){
                if(pokemons[val].name==data.name){
                    setBookmarked(true)
                }
            }
        }
    },[pokemons])

    const getPokemons = async () => {
        try
        {const value = await AsyncStorage.getItem('@Bookmarked_Pokemons');
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

    const savePokemon = async (pokename:string) => {
        try{
            pokemons.push({name:pokename,data:data})
            await AsyncStorage.setItem('@Bookmarked_Pokemons', JSON.stringify(pokemons));
            setBookmarked(true)}
        catch(e){
            console.log("Error Storing")
            setBookmarked(false)
        }
    }
    const deletePokemon = async (pokename:string) => {
        try{
            await AsyncStorage.setItem('@Bookmarked_Pokemons', JSON.stringify(pokemons.filter(poke=>poke.name!=pokename)));
            setBookmarked(false)}
        catch(e){
            console.log("Error Deleting")
            setBookmarked(true)
        }
    }

    useEffect(()=>{
        if(route.params.data!=undefined){
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}/`)
            .then((response)=>response.json())
            .then((result)=>{
                setSpeciesData(result)})
            .catch((e)=>console.log(e))
        }
    },[route])
    const handlePress = (index: number) => {
        setActiveIndex(index);
        Animated.spring(barPosition, {
          toValue: index,
          useNativeDriver: false,
        }).start();
      };
    
    const renderTouchables = () => {
        const touchables = ['About', 'Base Stats', 'Evolution', 'Moves'];
    
        return touchables.map((label, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index)}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: index === activeIndex ? (colorcode as ColorCodes)[convertToTitleCase(data.types[0].type.name)] || 'black' : 'black',
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ));
      };  
      
    
    return(
        <View style={{width:"100%",height:"100%",backgroundColor:(colorcode as ColorCodes)[convertToTitleCase(data.types[0].type.name)] || 'white',alignItems:'center'}}>
                <View style={{width:"100%",alignItems:'center',flex:1.5,marginTop:20}}>
                <Image source={require("./Helpers/pokeball_inv.png")} style={{position:'absolute',tintColor:"rgba(255,255,255,0.3)",height:180,width:180,bottom:"-10%",right:"-8%",transform:[{rotate:"-35deg"}]}}/>
                <Image source={require("./Helpers/pokeball_inv.png")} style={{position:'absolute',tintColor:"rgba(255,255,255,0.3)",height:100,width:100,top:"40%",left:"0%",transform:[{rotate:"35deg"}]}}/>
                <Image source={require("./Helpers/pokeball_inv.png")} style={{position:'absolute',tintColor:"rgba(255,255,255,0.3)",height:70,width:70,top:"30%",right:"3%",transform:[{rotate:"50deg"}]}}/>
                <View style={{flexDirection:'row',width:"90%",alignItems:'center',justifyContent:'center',marginTop:20,marginBottom:5}}>          
                <Text style={{fontSize:42,fontWeight:"800",color:'white',height:55,flex:6}}>{capitalizeFirstLetter(data.name)}</Text>      
                <TouchableOpacity onPress={()=>{
                    if(!bookmarked){
                        savePokemon(data.name)
                        .then(()=>{})}
                    else{
                        deletePokemon(data.name)}
                    }} 
                style={{height:55,justifyContent:'center',alignItems:'center',flex:1}}>
                <Image source={bookmarked?bookmarkOn:bookmarkOff} style={{height:30,width:30,tintColor:'white',}}/>
                </TouchableOpacity>
                </View>
                <View style={{width:"90%"}}>
                    <FlatList 
                    data={data.types}
                    renderItem={({item})=> <Item item={item}/>}
                    keyExtractor={(item, index) => `${index}-${item}`}
                    contentContainerStyle={{backgroundColor:'transparent',}}
                    ItemSeparatorComponent={<View style={{width:5}}/>}
                    horizontal={true}
                    />
                </View>
                </View>
                <View style={{backgroundColor:"white",width:"100%",borderTopRightRadius:40,borderTopLeftRadius:40,flex:2,alignItems:'center'}}>
                    <View style={{backgroundColor:'transparent',position:'absolute',top:"-48%"}}>
                        <Image source={{uri:data.sprites.other["official-artwork"].front_default}} style={{width:280,height:280}} />
                    </View>
                    <View style={{backgroundColor:'transparent',height:40,width:"100%",marginTop:"12%",flexDirection:'row',justifyContent:'space-evenly'}}>
                        {renderTouchables()}
                    </View>
                    {activeIndex==0 && speciesData!=undefined?
                    <View style={{width:"86%",marginTop:"2%"}}>
                        <View style={{flexDirection:'row',marginVertical:8}}><Text style={{flex:1,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Species</Text><Text style={{flex:2.5,fontSize:15,color:'black',fontWeight:"600"}}>{capitalizeFirstLetter(data.species.name)}</Text></View>
                        <View style={{flexDirection:'row',marginVertical:8}}><Text style={{flex:1,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Height</Text><Text style={{flex:2.5,fontSize:15,color:'black',fontWeight:"600"}}>{`${Math.floor((data.height * 3.937) / 12)}'${((data.height * 3.937) % 12).toFixed(2)}" (${data.height / 10}m)`}</Text></View>
                        <View style={{flexDirection:'row',marginVertical:8}}><Text style={{flex:1,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Weight</Text><Text style={{flex:2.5,fontSize:15,color:'black',fontWeight:"600"}}>{`${(data.weight / 10).toFixed(2)} kgs (${(data.weight * 0.220462).toFixed(2)} lbs)`}</Text></View>
                        <View style={{flexDirection:'row',marginVertical:8}}><Text style={{flex:1,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Abilities</Text><Text style={{flex:2.5,fontSize:15,color:'black',fontWeight:"600"}}>{data.abilities.map(item=>convertToTitleCase(item.ability.name)).join(", ")}</Text></View>
                        <Text style={{width:"100%",color:"black",marginVertical:15,fontSize:17,fontWeight:"600"}}>Breeding</Text>
                        <View style={{flexDirection:'row',marginVertical:8}}><Text style={{flex:1,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Gender</Text><Text style={{flex:2.5,fontSize:15,color:'black',fontWeight:"600"}}><Text style={{color:"#f2c6d6"}}>♀ </Text>{(speciesData.gender_rate/ 8 * 100).toFixed(2)}<Text style={{color:"#b7badc"}}> ♂ </Text>{(100-speciesData.gender_rate/ 8 * 100).toFixed(2)}</Text></View>
                        <View style={{flexDirection:'row',marginVertical:8}}><Text style={{flex:1,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Egg Groups</Text><Text style={{flex:2.5,fontSize:15,color:'black',fontWeight:"600"}}>{speciesData.egg_groups.map(item=>convertToTitleCase(item.name)).join(", ")}</Text></View>
                        <View style={{flexDirection:'row',marginVertical:8}}><Text style={{flex:1,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Egg Cycle</Text><Text style={{flex:2.5,fontSize:15,color:'black',fontWeight:"600"}}>{speciesData.egg_groups.map(item=>convertToTitleCase(item.name))[0]}</Text></View>
                    </View>:null}
                    {activeIndex==1 && speciesData!=undefined?<View style={{width:"86%",marginTop:"2%"}}>
                        <View style={{flexDirection:'row',marginVertical:10,alignItems:'center'}}>
                            <Text style={{flex:1.2,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>HP</Text>
                            <Text style={{color:'black',flex:0.5,fontSize:15,fontWeight:"600"}}>{data.stats[0].base_stat}</Text>
                            <View style={{flex:4,flexDirection:'row',paddingLeft:5,height:5,}}>
                                <View style={[{flex:data.stats[0].base_stat,borderTopLeftRadius:5,borderBottomLeftRadius:5},data.stats[0].base_stat>=50?{backgroundColor:"#77c696"}:{backgroundColor:'#e49697'}]}></View>
                                <View style={{flex:100-data.stats[0].base_stat,backgroundColor:"rgba(0,0,0,0.09)",borderTopRightRadius:5,borderBottomRightRadius:5}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row',marginVertical:10,alignItems:'center'}}>
                            <Text style={{flex:1.2,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Attack</Text>
                            <Text style={{color:'black',flex:0.5,fontSize:15,fontWeight:"600"}}>{data.stats[1].base_stat}</Text>
                            <View style={{flex:4,flexDirection:'row',paddingLeft:5,height:5,}}>
                                <View style={[{flex:data.stats[1].base_stat,borderTopLeftRadius:5,borderBottomLeftRadius:5},data.stats[1].base_stat>=50?{backgroundColor:"#77c696"}:{backgroundColor:'#e49697'}]}></View>
                                <View style={{flex:100-data.stats[1].base_stat,backgroundColor:"rgba(0,0,0,0.09)",borderTopRightRadius:5,borderBottomRightRadius:5}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row',marginVertical:10,alignItems:'center'}}>
                            <Text style={{flex:1.2,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Defence</Text>
                            <Text style={{color:'black',flex:0.5,fontSize:15,fontWeight:"600"}}>{data.stats[2].base_stat}</Text>
                            <View style={{flex:4,flexDirection:'row',paddingLeft:5,height:5,}}>
                                <View style={[{flex:data.stats[2].base_stat,borderTopLeftRadius:5,borderBottomLeftRadius:5},data.stats[2].base_stat>=50?{backgroundColor:"#77c696"}:{backgroundColor:'#e49697'}]}></View>
                                <View style={{flex:100-data.stats[2].base_stat,backgroundColor:"rgba(0,0,0,0.09)",borderTopRightRadius:5,borderBottomRightRadius:5}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row',marginVertical:10,alignItems:'center'}}>
                            <Text style={{flex:1.2,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Sp. Atk</Text>
                            <Text style={{color:'black',flex:0.5,fontSize:15,fontWeight:"600"}}>{data.stats[3].base_stat}</Text>
                            <View style={{flex:4,flexDirection:'row',paddingLeft:5,height:5,}}>
                                <View style={[{flex:data.stats[3].base_stat,borderTopLeftRadius:5,borderBottomLeftRadius:5},data.stats[3].base_stat>=50?{backgroundColor:"#77c696"}:{backgroundColor:'#e49697'}]}></View>
                                <View style={{flex:100-data.stats[3].base_stat,backgroundColor:"rgba(0,0,0,0.09)",borderTopRightRadius:5,borderBottomRightRadius:5}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row',marginVertical:10,alignItems:'center'}}>
                            <Text style={{flex:1.2,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Sp. Def</Text>
                            <Text style={{color:'black',flex:0.5,fontSize:15,fontWeight:"600"}}>{data.stats[4].base_stat}</Text>
                            <View style={{flex:4,flexDirection:'row',paddingLeft:5,height:5,}}>
                                <View style={[{flex:data.stats[4].base_stat,borderTopLeftRadius:5,borderBottomLeftRadius:5},data.stats[4].base_stat>=50?{backgroundColor:"#77c696"}:{backgroundColor:'#e49697'}]}></View>
                                <View style={{flex:100-data.stats[4].base_stat,backgroundColor:"rgba(0,0,0,0.09)",borderTopRightRadius:5,borderBottomRightRadius:5}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row',marginVertical:10,alignItems:'center'}}>
                            <Text style={{flex:1.2,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Speed</Text>
                            <Text style={{color:'black',flex:0.5,fontSize:15,fontWeight:"600"}}>{data.stats[5].base_stat}</Text>
                            <View style={{flex:4,flexDirection:'row',paddingLeft:5,height:5,}}>
                                <View style={[{flex:data.stats[5].base_stat,borderTopLeftRadius:5,borderBottomLeftRadius:5},data.stats[5].base_stat>=50?{backgroundColor:"#77c696"}:{backgroundColor:'#e49697'}]}></View>
                                <View style={{flex:100-data.stats[5].base_stat,backgroundColor:"rgba(0,0,0,0.09)",borderTopRightRadius:5,borderBottomRightRadius:5}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row',marginVertical:10,alignItems:'center'}}>
                            <Text style={{flex:1.2,fontSize:15,color:'rgba(0,0,0,0.6)',fontWeight:"500"}}>Total</Text>
                            <Text style={{color:'black',flex:0.5,fontSize:15,fontWeight:"600"}}>{data.stats.reduce((acc, stat) => acc + stat.base_stat, 0)}</Text>
                            <View style={{flex:4,flexDirection:'row',paddingLeft:5,height:5,}}>
                                <View style={[{flex:data.stats.reduce((acc, stat) => acc + stat.base_stat, 0),borderTopLeftRadius:5,borderBottomLeftRadius:5},data.stats.reduce((acc, stat) => acc + stat.base_stat, 0)>=300?{backgroundColor:"#77c696"}:{backgroundColor:'#e49697'}]}></View>
                                <View style={{flex:600-data.stats.reduce((acc, stat) => acc + stat.base_stat, 0),backgroundColor:"rgba(0,0,0,0.09)",borderTopRightRadius:5,borderBottomRightRadius:5}}></View>
                            </View>
                        </View>
                    </View>:null}
                </View>
        </View>
    )
}
export default DetailsPage

const Item = ({item}) => {
    return(
        <View style={{width:"auto",backgroundColor:"rgba(255,255,255,0.3)",borderRadius:50}}>
            <Text style={{paddingHorizontal:15,paddingVertical:5,fontWeight:'500',color:'white'}}>{convertToTitleCase(item.type.name)}</Text>
        </View>
    )
}