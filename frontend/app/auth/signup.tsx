import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, ToastAndroid } from "react-native";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Axios } from "@/utils/Axios";

const signup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const signUpFunction = async (data: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      const res = await Axios.post("/api/v1/auth/", {
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });
      ToastAndroid.show("Sign up complete", ToastAndroid.SHORT);
      router.replace("/auth/signin"); // Redirect to signin after successful signup
    } catch (err: any) {
      ToastAndroid.show(
        err.response?.data?.message || "Signup failed",
        ToastAndroid.SHORT
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 relative">
      <View className="w-full h-full">
        <Image
          className="object-cover w-full h-full"
          source={require("../../assets/images/splashscreen.jpg")}
        />
      </View>

      <View className="absolute bg-black/80 top-0 left-0 right-0 h-full pt-10 w-full">
        <View className="flex justify-between items-center flex-row px-5 w-full">
          <TouchableOpacity
            className="flex items-center flex-row gap-1"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/auth/signin")}
            className="bg-gray-700/30 px-7 py-3 rounded-md"
          >
            <Text className="text-secondary font-outfit-medium text-lg">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex items-center justify-center mt-20 px-5">
          <Text className="font-outfit-bold text-3xl text-white mb-4">
            Sign Up
          </Text>
          <View className="flex gap-4 w-full">
            {/* Full Name */}
            <View className="flex w-full gap-2">
              <Text className="text-secondary text-outfit-medium text-lg">
                Full Name
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Full name is required",
                  minLength: {
                    value: 3,
                    message: "Full name must be at least 3 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Full name must be less than 50 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z ]+$/,
                    message: "Full name can only contain letters and spaces",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Enter your full name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="border-[1px] placeholder:text-gray-400 text-white text-outfit-medium text-xl border-secondary p-4 rounded-lg bg-gray-500/20"
                  />
                )}
                name="fullName"
              />
              {errors.fullName && (
                <Text className="text-red-500 text-outfit-medium">
                  {errors.fullName.message}
                </Text>
              )}
            </View>

            {/* Email */}
            <View className="flex w-full gap-2">
              <Text className="text-secondary text-outfit-medium text-lg">
                Email
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Enter your email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border-[1px] placeholder:text-gray-400 text-white text-outfit-medium text-xl border-secondary p-4 rounded-lg bg-gray-500/20"
                  />
                )}
                name="email"
              />
              {errors.email && (
                <Text className="text-red-500 text-outfit-medium">
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View className="flex w-full gap-2">
              <Text className="text-secondary text-outfit-medium text-lg">
                Password
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Enter your password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    className="border-[1px] placeholder:text-gray-400 text-white text-outfit-medium text-xl border-secondary p-4 rounded-lg bg-gray-500/20"
                  />
                )}
                name="password"
              />
              {errors.password && (
                <Text className="text-red-500 text-outfit-medium">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View className="flex w-full gap-2">
              <Text className="text-secondary text-outfit-medium text-lg">
                Confirm Password
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Confirm your password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    className="border-[1px] placeholder:text-gray-400 text-white text-outfit-medium text-xl border-secondary p-4 rounded-lg bg-gray-500/20"
                  />
                )}
                name="confirmPassword"
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-outfit-medium">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit(signUpFunction)}
              disabled={loading}
              className="w-full mt-4 bg-secondary p-4 rounded-xl"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-outfit-medium text-white text-center text-2xl">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex flex-row items-center gap-4 w-full my-12">
            <View className="flex-grow h-1 bg-gray-500 rounded-full"></View>
            <Text className="text-gray-500 font-outfit w-fit">Sign Up With</Text>
            <View className="flex-grow h-1 bg-gray-500 rounded-full"></View>
          </View>

          <View className="flex flex-row gap-4">
            <TouchableOpacity className="flex flex-row items-center gap-2 justify-center bg-white w-1/2 p-2 rounded-xl">
              <Image
                source={require("../../assets/images/google.png")}
                className="h-10 w-10 object-cover"
              />
              <Text className="font-outfit-medium text-2xl">Google</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex flex-row justify-center gap-2 items-center bg-black w-1/2 p-2 rounded-xl">
              <Image
                source={require("../../assets/images/applebig.png")}
                className="h-10 w-10 object-cover"
              />
              <Text className="font-outfit-medium text-2xl text-white">
                Apple
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default signup;