import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Modal, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AWS from 'aws-sdk';
import randomBytes from 'randombytes';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, REGION_S3, BUCKET_NAME_S3, ACCESS_KEY_ID_S3, SECRET_ACCESS_KEY_S3, SERVER_LINK } from '@env';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import GlobalStyles, { colors, fonts, spacing, borderRadius } from './globalStyles';
import PulsingButton from './components/PulsingButton';
import EmailInput from './components/EmailInput';

const { width } = Dimensions.get('window');
const imageSize = width * 0.8;

// Configure the AWS SDK
const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID_S3,
  secretAccessKey: SECRET_ACCESS_KEY_S3,
  region: REGION_S3,
});

export default function CaptureImageScreen() {
  const [facing, setFacing] = useState('front');
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
  const [disableCapture, setDisableCapture] = useState(false);
  const router = useRouter();
  const { eventID } = useLocalSearchParams();

  const [countdown, setCountdown] = useState(3);
  const [isCounting, setIsCounting] = useState(false);


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
    setFacing(current => (current === 'front' ? 'back' : 'front'));
  };

  const startCountdown = async () => {
    setDisableCapture(true);
    setIsCounting(true);
    let counter = countdown;

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
      counter -= 1;

      if (counter === 0) {
        clearInterval(timer);
        setIsCounting(false);
        takePicture();
      }
    }, 1000);
  };

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync({ base64: true });
      setPhotoUri(photo.uri);
      const source = photo.base64;
      let base64Img = `data:image/jpg;base64,${source}`;
      setPhoto(base64Img);
      setDisableCapture(false);
      setCountdown(3); // resset countdown
      setModalVisible(true); //open email modal
    }
  };

  const retakePicture = () => {
    setPhotoUri(null);
  };

  const handleContinue = () => {
    setModalVisible(true);
  };

  const uploadImageToS3 = async (photoUri) => {

    const rawBytes = randomBytes(16);
    const hexFileName = rawBytes.toString('hex');
  
    const response = await fetch(photoUri);
    const blob = await response.blob();

    const params = {
      Bucket: BUCKET_NAME_S3,
      Key: `${hexFileName}.jpg`,
      Body: blob,
      ContentType: 'image/jpeg',
    };
  
    try {
      const data = await s3.upload(params).promise();
      return {
        location: data.Location, // The URL of the uploaded file
        fileName: hexFileName, // The generated hex file name
      };
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Failed to upload image');
    }
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
      setLoading(true);
      // Upload the image to S3
      const { location: secureUrl, fileName } = await uploadImageToS3(photoUri);
      setSecureUrl(secureUrl);

      // Prepare the data to be sent to the backend
      const photoData = {
        fileID: fileName,
        eventID: eventID,
        imageUrl: secureUrl,
        phoneNumber: phoneNumber || null,
        email: email || null,
      };

      // Send the photo data to the backend
      const response = await axios.post(`${SERVER_LINK}/add-photo`, photoData);
      
      if (response.data.status === 'ok') {
        // Alert.alert('Success', 'Photo added to event gallery successfully.');
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
    finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {photoUri && modalVisible ? (
        <View style={styles.preview}>
          <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {logoUrl ? (
              <Image 
                source={{ uri: logoUrl }} 
                style={{ 
                  width: 64, 
                  height: 64, 
                }} 
              />
            ) : null}
            <Text style={{...fonts.display, fontSize: fonts.size_24}}>Photo Preview</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoUri }} style={styles.imagePreview} />
          </View>
          <View style={GlobalStyles.buttonContainer}>
            <TouchableOpacity style={{...GlobalStyles.button, backgroundColor: 'transparent', width: 'fit-content'}} onPress={retakePicture}>
              <Text style={{...GlobalStyles.buttonText, color: colors.lightGray}}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{...GlobalStyles.button, width: '200px'}} onPress={handleContinue}>
              <Text style={GlobalStyles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={(ref) => setCameraRef(ref)}
          className="camera-view"
        >
          {logoUrl && (
            <View 
              style={{
                ...GlobalStyles.buttonContainer, 
                padding: spacing.lg,
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: '100%',
              }}
            >
              <Image 
                source={{ uri: logoUrl }} 
                style={{ 
                  width: 100, 
                  height: 64,
                  zIndex: 1, 
                  margin: 'auto',
                  resizeMode: 'contain',
                }} 
              />
            </View>
          )}

          <Text style={{...fonts.display, fontSize: 240}}>{isCounting && countdown}</Text>

          <View 
            style={{
              ...GlobalStyles.buttonContainer, 
              padding: spacing.lg,
              backgroundColor: 'rgba(0,0,0,0.5)',
              width: '100%',
            }}
          >
            <TouchableOpacity style={{width: 'fit-content'}} onPress={() => router.back()}>
              <FontAwesome name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <PulsingButton disableCapture={disableCapture} startCountdown={startCountdown} />
            <TouchableOpacity style={{width: 'fit-content'}} onPress={toggleCameraFacing}>
              <FontAwesome name="refresh" size={24} color={colors.text} />
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
            <Text style={{...fonts.display, fontSize: fonts.size_24, marginBottom: spacing.lg}}>Share Your Photos</Text>
            {/* <Text style={styles.modalSubText}>How would you like to receive your photos?</Text> */}

            {/* <TextInput
              style={GlobalStyles.textInput}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            
            <Text style={styles.modalSubText}>OR</Text> */}

            <EmailInput email={email} setEmail={setEmail} />

            <View style={GlobalStyles.buttonContainer}>
              <TouchableOpacity 
                style={{
                  ...GlobalStyles.buttonSecondary, 
                  backgroundColor: 'transparent', 
                  width: '50%'
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={GlobalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                disabled={loading} 
                style={{
                  ...GlobalStyles.button, width: '50%',
                  backgroundColor: loading ? colors.gray[100] : colors.primary
                }} 
                onPress={handleSubmit}
              >
                <Text style={GlobalStyles.buttonText}>{loading ? 'Sending' : 'Submit'}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderRadius: borderRadius.xxl,
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
    color: colors.lightGray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});