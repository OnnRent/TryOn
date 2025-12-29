import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";

export async function requestCameraPermission() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === "granted";
}

export async function requestGalleryPermission() {
  const { status } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
}
