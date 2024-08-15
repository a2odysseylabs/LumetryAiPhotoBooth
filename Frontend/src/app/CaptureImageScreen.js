import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Modal, TextInput } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

export default function CaptureImageScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [secureUrl, setSecureUrl] = useState(null);
  const router = useRouter();
  const { eventName } = useLocalSearchParams();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setPhotoUri(photo.uri);
      const source = photo.base64;
      let base64Img = `data:image/jpg;base64,${source}`;
      setPhoto(base64Img);
    }
  };

  const retakePicture = () => {
    setPhotoUri(null);
  };

  const handleContinue = () => {
    setModalVisible(true);
  };

  const uploadImageToCloudinary = async (photoUri) => {
    const data = new FormData();
    data.append('file', photo);
    data.append('upload_preset','lumetry');
    data.append("cloud_name", "dfnggrmqp");

    try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dfnggrmqp/image/upload`,
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data.secure_url;
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error.response ? error.response.data : error.message);
        throw new Error('Failed to upload image');
      }
    };

const handleSubmit = async () => {
  if (!phoneNumber && !email) {
    Alert.alert('Error', 'Please enter either a phone number or an email.');
    return;
  }

  try {
    // Upload the image to Cloudinary
    const secureUrl = await uploadImageToCloudinary(photoUri);
    setSecureUrl(secureUrl);

    // Prepare the data to be sent to the backend
    const photoData = {
      eventName: eventName,
      imageUrl: secureUrl,
      phoneNumber: phoneNumber || null,
      email: email || null,
    };

    // Send the photo data to the backend
    const response = await axios.post('http://localhost:5001/add-photo', photoData);
    console.log(response);
    
    if (response.data.status === 'ok') {
      Alert.alert('Success', 'Photo added to event gallery successfully.');
      router.push({ pathname: '/event-details', params: { eventName: eventName } });
    } else {
      Alert.alert('Error', response.data.data);
    }

    setModalVisible(false);
  } catch (error) {
    console.error('Error submitting details:', error);
    Alert.alert('Error', 'Failed to submit details');
  }
};

  return (
    <View style={styles.container}>
      {photoUri ? (
        <View style={styles.preview}>
          <Text style={styles.title}>Photo Preview</Text>
          <Image source={{ uri: photoUri }} style={styles.imagePreview} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={retakePicture}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.continueButton]} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={(ref) => setCameraRef(ref)}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.captureButton]} onPress={takePicture}>
              <Text style={styles.buttonText}>Take Picture</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}

      {/* Modal for phone number or email input */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Enter Your Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.continueButton]} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#8B0000', // Dark red color
  },
  continueButton: {
    backgroundColor: '#8B0000', // Dark red color
  },
  permissionButton: {
    backgroundColor: '#8B0000', // Dark red color
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '70%',
    borderRadius: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 5,
  },
});