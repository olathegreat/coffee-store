import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, ToastAndroid } from "react-native";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Axios } from "@/utils/Axios";

const Signin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInFunction = async (data: { email: string; password: string }) => {
    try {
      setLoading(true);
      const res = await Axios.post("/api/v1/auth/login", {
        email: data.email,
        password: data.password,
      });
      ToastAndroid.show("Login successful!", ToastAndroid.SHORT);
      router.replace("/home");
    } catch (err: any) {
      ToastAndroid.show(
        err.response?.data?.message || "Login failed. Please try again.",
        ToastAndroid.SHORT
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 relative">
      {/* Background Image */}
      <Image
        source={require("../../assets/images/splashscreen.jpg")}
        className="absolute w-full h-full"
      />

      {/* Form Overlay */}
      <View className="absolute bg-black/80 w-full h-full pt-10">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1">
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.replace("/auth/signup")}
            className="bg-gray-700/30 px-7 py-3 rounded-md"
          >
            <Text className="text-secondary font-outfit-medium text-lg">Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="px-5 mt-20">
          <Text className="font-outfit-bold text-3xl text-white mb-4 text-center">Welcome Back</Text>
          
          <View className="gap-4">
            {/* Email */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: { 
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field }) => (
                <View>
                  <Text className="text-secondary text-outfit-medium text-lg">Email</Text>
                  <TextInput
                    {...field}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border border-secondary p-4 rounded-lg bg-gray-500/20 text-white"
                  />
                  {errors.email && <Text className="text-red-500 mt-1">{errors.email.message}</Text>}
                </View>
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: { value: 8, message: "Minimum 8 characters" }
              }}
              render={({ field }) => (
                <View>
                  <Text className="text-secondary text-outfit-medium text-lg">Password</Text>
                  <TextInput
                    {...field}
                    placeholder="••••••••"
                    secureTextEntry
                    className="border border-secondary p-4 rounded-lg bg-gray-500/20 text-white"
                  />
                  {errors.password && <Text className="text-red-500 mt-1">{errors.password.message}</Text>}
                </View>
              )}
            />

            {/* Forgot Password */}
            <TouchableOpacity className="self-end">
              <Text className="text-secondary">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(signInFunction)}
              disabled={loading}
              className="bg-secondary p-4 rounded-xl mt-4"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-outfit-medium text-2xl text-center">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Login Divider */}
          <View className="flex-row items-center my-12">
            <View className="flex-1 h-px bg-gray-500" />
            <Text className="text-gray-500 px-4">Sign In With</Text>
            <View className="flex-1 h-px bg-gray-500" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-white p-3 rounded-xl gap-2">
              <Image source={require("../../assets/images/google.png")} className="w-8 h-8" />
              <Text className="font-outfit-medium text-lg">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-black p-3 rounded-xl gap-2">
              <Image source={require("../../assets/images/applebig.png")} className="w-8 h-8" />
              <Text className="font-outfit-medium text-lg text-white">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Signin;