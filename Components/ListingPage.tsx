import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator,Modal,Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import colorcode from "./Helpers/colorcoding.json";
import imagecode from "./Helpers/imagecoding.json"

interface Pokemon {
  name: string;
  url: string;
  types: PokemonType[];
}

interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

interface ColorCodes {
  [key: string]: string;
}
interface ImageCodes {
  [key: string]: string;
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function convertToTitleCase(str: string) {
  const words = str.split('-');
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords.join(' ');
}

const ListingPage = ({ navigation, route }) => {
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPokemonData, setFilteredPokemonData] = useState<Pokemon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible,setModalVisible] = useState(false)
  const [typeFilter,setTypeFilter] = useState("")

  useEffect(() => {
    fetchPokemonData();
  }, []);

  const fetchPokemonData = async (url?: string) => {
    try {
      setIsLoading(true);
      const apiUrl = url || 'https://pokeapi.co/api/v2/pokemon?page=' + currentPage;
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon: Pokemon) => {
          const response = await fetch(pokemon.url);
          const details = await response.json();
          pokemon.types = details.types;
          return pokemon;
        })
      );

      let filteredData: Pokemon[] = []
      if(typeFilter!=""){
        filteredData = pokemonDetails.filter(pokemon => pokemon.types.some(type => type.type.name.toLowerCase() === typeFilter.toLowerCase()))
      }

      setPokemonData(prevData => [...prevData, ...pokemonDetails]);
      setFilteredPokemonData(prevData => [...prevData, ...filteredData]);
      setNextPageUrl(data.next);
      setIsLoading(false);
      setCurrentPage(currentPage + 1); 
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  

  const handleEndReached = () => {
    if (!isLoading && nextPageUrl) {
      fetchPokemonData(nextPageUrl)
    }
  };
  const searchPokemon = async (value:string) => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${value}`)
    .then((response) => {
        if(response.status==200){
            return response.json()
        }else {
            throw new Error("Not Found"); 
        }
    })
    .then((data) => {
        navigation.navigate("Details",{data:data})
    })
    .catch((error) => {
    });
}
  const Item = ({ mainItem }: { mainItem: Pokemon }) => {
    return (
      <TouchableOpacity onPress={()=>{searchPokemon(mainItem.name)}} style={{ alignItems: 'center', width: 180, backgroundColor: (colorcode as ColorCodes)[convertToTitleCase(mainItem.types[0].type.name)] || "transparent", borderRadius: 10, marginVertical: 5, marginHorizontal: 5, overflow: 'hidden' }}>
        <Text style={{ fontSize: 17, fontWeight: "700", color: 'white', marginTop: 10, width: "90%" }}>{capitalizeFirstLetter(mainItem.name)}</Text>
        <View style={{ flexDirection: 'row', width: "90%", marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <FlatList
              data={mainItem.types}
              renderItem={({ item }) => <SubItem item={item} />}
              keyExtractor={(item, index) => `${index}-${item}`}
              ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
            />
          </View>
          <View style={{ flex: 1.2, justifyContent: 'center', alignItems: 'flex-end' }}>
            <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mainItem.url.match(/\/pokemon\/(\d+)\//)![1]}.png` }} style={{ width: 70, height: 70 }} />
          </View>
          <Image source={require("./Helpers/pokeball_inv.png")} style={{ position: 'absolute', tintColor: "rgba(255,255,255,0.3)", height: 120, width: 120, top: "-10%", right: "-20%", transform: [{ rotate: "0deg" }], zIndex: -1 }} />
        </View>
      </TouchableOpacity>
    );
  };
  const RenderItem = ({item}:{item:[string,string]}) => {
    return(
      <Pressable onPress={()=>{
        let filteredData: Pokemon[] = []
        filteredData = pokemonData.filter(pokemon => pokemon.types.some(type => type.type.name.toLowerCase() === item[0].toLowerCase()))
        setFilteredPokemonData(filteredData);
        setTypeFilter(item[0])
        setModalVisible(false)
        }} 
        style={[{justifyContent:'center',alignItems:'center',margin:10,height:60,width:70},typeFilter==item[0]?{transform:[{scale:1.25}]}:{transform:[{scale:1}]}]}>
        <View style={{height:45,width:45,justifyContent:'center',borderRadius:45/2,alignItems:'center',backgroundColor:Object.entries(colorcode).filter(ele=>ele[0]==item[0])[0][1]}}><Image source={{uri:item[1]}} style={{height:32,width:32}}/></View>
        <Text style={{color:"white",fontSize:15,fontWeight:"700",marginVertical:2}}>{item[0]}</Text>
      </Pressable>
    )
  }
  return (
    <View style={{ height: "100%", width: "100%", backgroundColor: '#2d3151' }}>
      <Modal
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:'rgba(0,0,0,0.5)' }}>
          <FlatList 
           data={Object.entries(imagecode)}
           keyExtractor={(item)=>item[0].toString()}
           renderItem={({item})=><RenderItem item={item}/>}
           numColumns={3}
           contentContainerStyle={{ justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 10, flex: 1 }}
            ListFooterComponent={()=><View style={{flexDirection:'row',justifyContent:'space-evenly',width:"100%"}}>
              <TouchableOpacity onPress={() => {setTypeFilter("");setFilteredPokemonData([])}} style={{backgroundColor:"#f6b815",borderRadius:10}} ><Text style={{color:"#2d3151",fontWeight:"800",paddingHorizontal:30,paddingVertical:10,fontSize:18}}>CLEAR</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{backgroundColor:"#f6b815",borderRadius:10}} ><Text style={{color:"#2d3151",fontWeight:"800",paddingHorizontal:30,paddingVertical:10,fontSize:18}}>CLOSE</Text></TouchableOpacity>
            </View>}
          />
        </View>
      </Modal>
      <View style={{ height: 57 }}></View>
      <View style={{width:"100%",alignItems:'center',marginVertical:10}}>
        <Pressable onPress={()=>{setModalVisible(true)}} style={{width:"95%",backgroundColor:'#f6b815',borderRadius:10,justifyContent:'center',alignItems:'center'}}>
        <Text style={{color:'#2d3151',fontWeight:"800",paddingVertical:10,fontSize:18,}}>Choose Pokemon Type</Text>
      </Pressable></View>
      <FlatList<Pokemon>
        data={filteredPokemonData.length > 0 ? filteredPokemonData : pokemonData}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <Item mainItem={item} />}
        numColumns={Math.floor(Dimensions.get('window').width / 180)}
        contentContainerStyle={{ justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading ? <ActivityIndicator color="white" size="small" /> : null}
      />
    </View>
  );
};

export default ListingPage;

const SubItem = ({ item }) => {
  return (
    <View style={{ width: "auto", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 50, alignItems: 'center' }}>
      <Text style={{ paddingHorizontal: 7, paddingVertical: 3, fontWeight: '500', color: 'white', fontSize: 13 }}>{convertToTitleCase(item.type.name)}</Text>
    </View>
  );
};
