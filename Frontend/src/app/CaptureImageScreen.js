import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Modal, TextInput, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, SERVER_LINK } from '@env';
import GlobalStyles, { colors, fonts, spacing } from './globalStyles';

const { width } = Dimensions.get('window');
const imageSize = width * 0.8;


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
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPlacement, setLogoPlacement] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { eventID } = useLocalSearchParams();


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${SERVER_LINK}/events`);
        const events = response.data.data;
        const event = events.find(event => event._id === eventID);

        if (event) {
          setLogoUrl(event.event_logo);
          setLogoPlacement(event.logo_placement);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        Alert.alert('Error', 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventID]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={{...styles.container, flex: 1, alignItems: 'center'}}>
        <Text style={{...fonts.display, textAlign: 'center'}}>We need your permission to show the camera</Text>
        <TouchableOpacity style={{...GlobalStyles.button, width: 'fit-content'}} onPress={requestPermission}>
          <Text style={GlobalStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync({ base64: true });
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
    data.append('upload_preset',CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
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
      eventID: eventID,
      imageUrl: secureUrl,
      phoneNumber: phoneNumber || null,
      email: email || null,
    };

    // Send the photo data to the backend
    const response = await axios.post(`${SERVER_LINK}/add-photo`, photoData);
    // console.log(response);
    
    if (response.data.status === 'ok') {
      Alert.alert('Success', 'Photo added to event gallery successfully.');
      router.replace({
        pathname: '/SuccessScreen',
        params: { eventID: eventID },
      });      
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
      {logoUrl && (
      <Image 
        source={{ uri: logoUrl }} 
        style={{ width: 25, height: 25, alignSelf: 'center', marginTop: 20 }} 
      />
    )}
      {photoUri ? (
        <View style={styles.preview}>
          <Text style={fonts.display}>Photo Preview</Text>
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoUri }} style={styles.imagePreview} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={{...GlobalStyles.button, backgroundColor: 'transparent'}} onPress={retakePicture}>
              <Text style={GlobalStyles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[GlobalStyles.button]} onPress={handleContinue}>
              <Text style={GlobalStyles.buttonText}>Continue</Text>
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
            <TouchableOpacity style={{...GlobalStyles.button, backgroundColor: colors.gray[300]}} onPress={toggleCameraFacing}>
              <Text style={GlobalStyles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={GlobalStyles.button} onPress={takePicture}>
              <Text style={GlobalStyles.buttonText}>Take Picture</Text>
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
          <Text style={fonts.display}>Share Your Photos</Text>
          <Text style={styles.modalSubText}>How would you like to receive your photos?</Text>
            <TextInput
              style={GlobalStyles.textInput}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <Text style={styles.modalSubText}>OR</Text>
            <TextInput
              style={GlobalStyles.textInput}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={{...GlobalStyles.button, backgroundColor: 'transparent'}} onPress={() => setModalVisible(false)}>
                <Text style={GlobalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={GlobalStyles.button} onPress={handleSubmit}>
                <Text style={GlobalStyles.buttonText}>Submit</Text>
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
    backgroundColor: colors.gray[300],
    justifyContent: 'center', // Center the loader
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  preview: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  modalSubText: {
    color: '#AAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});