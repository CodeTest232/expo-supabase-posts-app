import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { TextInput, Button } from '../components';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  const validate = () => {
    let isValid = true;
    setTitleError('');
    setContentError('');

    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else if (title.trim().length < 3) {
      setTitleError('Title must be at least 3 characters');
      isValid = false;
    }

    if (!content.trim()) {
      setContentError('Content is required');
      isValid = false;
    } else if (content.trim().length < 10) {
      setContentError('Content must be at least 10 characters');
      isValid = false;
    }

    return isValid;
  };

  const pickImage = async () => {
    try {
      console.log('Image picker button clicked');
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library permissions to upload images',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Grant Permission', 
              onPress: async () => {
                const newStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (newStatus.granted) {
                  pickImage();
                }
              }
            },
          ]
        );
        return;
      }

      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Image selected:', result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      } else {
        console.log('Image picker was canceled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to open image picker. Please try again.',
        position: 'top',
      });
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleCreatePost = async () => {
    if (!validate()) return;

    setLoading(true);
    let imageUrl: string | undefined;

    try {
      if (imageUri) {
        setUploadingImage(true);
        const fileName = imageUri.split('/').pop() || `image-${Date.now()}.jpg`;
        imageUrl = await storageService.uploadImage(imageUri, fileName);
        setUploadingImage(false);
      }

      await postService.createPost({
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl,
      });

      setTitle('');
      setContent('');
      setImageUri(null);

      Toast.show({
        type: 'success',
        text1: 'Post Created!',
        text2: 'Your post has been created successfully',
        position: 'top',
        visibilityTime: 2000,
      });

      const parentNavigator = navigation.getParent();
      if (parentNavigator) {
        try {
          (parentNavigator as any).navigate('MyPostsTab');
        } catch {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Main',
              params: {
                screen: 'MyPostsTab',
              },
            })
          );
        }
      } else {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Main',
            params: {
              screen: 'MyPostsTab',
            },
          })
        );
      }
    } catch (error) {
      setUploadingImage(false);
      Toast.show({
        type: 'error',
        text1: 'Failed to Create Post',
        text2: error instanceof Error ? error.message : 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Post</Text>
              <Text style={styles.subtitle}>Share your thoughts</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="Enter post title"
                error={titleError}
                containerStyle={styles.inputContainer}
                maxLength={100}
              />

              <TextInput
                label="Content"
                value={content}
                onChangeText={setContent}
                placeholder="Write your post content..."
                multiline={true}
                numberOfLines={8}
                textAlignVertical="top"
                error={contentError}
                containerStyle={styles.inputContainer}
                style={styles.textArea}
              />

              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Image (Optional)</Text>
                {imageUri ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    <TouchableOpacity
                      onPress={removeImage}
                      style={styles.removeImageButton}
                    >
                      <Text style={styles.removeImageText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                    <Text style={styles.imagePickerText}>+ Select Image</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title={uploadingImage ? 'Uploading Image...' : 'Create Post'}
                onPress={handleCreatePost}
                loading={loading || uploadingImage}
                disabled={loading || uploadingImage}
                style={styles.button}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  button: {
    marginTop: 16,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  imagePickerButton: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CreatePostScreen;

