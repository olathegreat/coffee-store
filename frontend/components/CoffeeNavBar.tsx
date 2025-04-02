import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from "expo-router";
import { CartItem } from "@/utils/userCartSlice";
import { CoffeeData } from "@/utils/favoritesSlice";
import { useSelector } from "react-redux";

const CoffeeNavBar = ({heading,favoriteFunction, favoriteData}:{heading?: string, favoriteFunction?:()=>void, favoriteData?:CoffeeData}) => {
  
  const router = useRouter();
  const storedFavorites = useSelector((state:any) => state.favorites.favorites);
  const [favorite, setFavorite] = useState(false);
  const favoriteClick = ()=>{
    setFavorite(!favorite);
     favoriteFunction && favoriteFunction();
  }
  

  useEffect(()=>{
       const isFavorite = storedFavorites.some((item:CoffeeData) => item.type === favoriteData?.type && item.shortDesc === favoriteData?.shortDesc);

       setFavorite(isFavorite);
  },[])
  return (
    <View className="w-full h-20  flex flex-row justify-between items-center  ">
      <TouchableOpacity 
         onPress={()=>router.back()}
      
      className="h-10 w-10 rounded-md flex items-center justify-center bg-gray-700">
    
        
        <Ionicons name="chevron-back" size={24} color="gray" />
        
        
      </TouchableOpacity>
      
            <Text className="text-white  flex-grow text-center text-3xl font-outfit-medium">{heading}</Text>
      
{
  heading !== "Payment" &&

      <TouchableOpacity onPress={favoriteClick} className="h-10 w-10 rounded-xl bg-gray-800 flex items-center justify-center">
      <Ionicons name="heart" size={24} color={`${favorite ? "red": "gray"}`} />
      </TouchableOpacity>
      }
    </View>
  );
};

export default CoffeeNavBar;
