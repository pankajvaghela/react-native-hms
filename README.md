<a href="https://100ms.live/">
<img src="https://github.com/100mslive/100ms-react-native/blob/main/100ms.gif" height=256/> 
<img src="https://github.com/100mslive/100ms-react-native/blob/main/100ms.svg" title="100ms logo" float=center height=256>
</a>

# react-native-hms
[![npm](https://img.shields.io/npm/v/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![license](https://img.shields.io/npm/l/@100mslive/react-native-hms)](https://www.100ms.live/)
[![quality](https://img.shields.io/npms-io/quality-score/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![collaborators](https://img.shields.io/npm/collaborators/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![Documentation](https://img.shields.io/badge/Read-Documentation-blue)](https://docs.100ms.live/react-native/v2/foundation/basics)
[![Discord](https://img.shields.io/discord/843749923060711464?label=Join%20on%20Discord)](https://100ms.live/discord)
[![Firebase](https://img.shields.io/badge/Download%20Android-Firebase-green)](https://appdistribution.firebase.dev/i/7b7ab3b30e627c35)
[![TestFlight](https://img.shields.io/badge/Download%20iOS-TestFlight-blue)](https://testflight.apple.com/join/v4bSIPad)
[![Register](https://img.shields.io/badge/Contact-Know%20More-blue)](https://dashboard.100ms.live/register)

React native wrapper for 100ms SDK

## Installation

```bash
npm install @100mslive/react-native-hms --save

cd ios/ && pod install
```

📲 Download the Sample iOS App here: https://testflight.apple.com/join/v4bSIPad

🤖 Download the Sample Android App here: https://appdistribution.firebase.dev/i/7b7ab3b30e627c35



## Permissions

### For iOS Permissions
Add following lines in `Info.plist` file

```xml
<key>NSCameraUsageDescription</key>
<string>Please allow access to Camera to enable video conferencing</string>
<key>NSLocalNetworkUsageDescription</key>
<string>Please allow access to network usage to enable video conferencing</string>
<key>NSMicrophoneUsageDescription</key>
<string>Please allow access to Microphone to enable video conferencing</string>
```

### For Android Permissions
Add following permissions in `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

You will also need to request Camera and Record Audio permissions at runtime before you join a call or display a preview. Please follow [Android Documentation](https://developer.android.com/training/permissions/requesting#request-permission) for runtime permissions.

We suggest using [react-native-permission](https://www.npmjs.com/package/react-native-permissions) to acquire permissions from both platforms.


## QuickStart
The package exports four Classes and an HMSManager class that manages everything.

# Setting up the HMS Instance:
first we'll have to call build method, that method returns an instance of HMSManager class and the same is used to perform all the operations
```js
import HmsManager from 'react-native-hms';
...

const hmsInstance = await HmsManager.build();
//save this instance, will be used for all the operations that we'll perform

...
```

# Add event listeners
add event listeners for all the events such as onPreview, onJoin, onPeerUpdate etc. the actions can be found in HMSUpdateListenerActions class
```js
import HmsManager, {
  HMSUpdateListenerActions,
} from 'react-native-hms';
...

// instance acquired from build() method
hmsInstance.addEventListener(
  HMSUpdateListenerActions.ON_PREVIEW,
  previewSuccess, // function that will be called on Preview success
);

...
```
The event handlers are the way of handling any update happening in hms all events can be found in HMSUpdateListenerActions class


# Join the room
Joining the room connects you to the remote peer and broadcasts your stream to other peers, we need instance of HMSConfig in order to pass the details of room and user to join function
```js
import HmsManager, {
  HMSUpdateListenerActions,
  HMSConfig,
} from 'react-native-hms';
...

// instance acquired from build() method
const HmsConfig = new HMSConfig({authToken, userID, roomID});
instance.preview(HmsConfig); // to start preview
// or 
instance.join(HmsConfig); // to join a room

...
```
don't forget to add ON_JOIN listener before calling join to receive an event callback

# Viewing the video of a peer
To display a video on screen the package provide a UI component named HmsView that takes the video track ID and displays the video in that component, this component requires on *width* and *height* in *style* prop to set bounds of the tile that will show the video stream
```js
...

//getting local track ID
const localTrackId = instance?.localPeer?.videoTrack?.trackId;

// getting remote track IDs
const remotePeers = instance?.remotePeers
const remoteVideoIds: string[] = [];

remotePeers.map((remotePeer: any) => {
  const remoteTrackId = remotePeer?.videoTrack?.trackId;

  if (remoteTrackId) {
    remoteVideoIds.push(remoteTrackId);
  }
});

...
```

# Display a video in HmsView
```js
import { HmsView } from 'react-native-hms';

...
const styles = StyleSheet.create({
  hmsView: {
    height: '100%',
    width: '100%',
  },
});

// trackId can be acquired from the method explained above
<HmsView style={styles.hmsView} trackId={trackId} />

...
```

# Calling various functions of HMS
```js

// Mute Audio
instance.localPeer.localAudioTrack().setMute(isMute);

// Stop Video
instance.localPeer.localVideoTrack().setMute(muteVideo);

// Switch Camera
instance.localPeer.localVideoTrack().switchCamera();

// Leave the call
instance.leave()

```

# Sending messages
```js
import { HMSMessage } from '@100mslive/react-native-hms';
  
// message object
const message = new HMSMessage({
  type: 'chat',
  time: new Date().toISOString(),
  message: value,
});
  
// send a message
instance.send(message);
  
```
  
# Error handling
```js
// import actions
import { HMSUpdateListenerActions } from '@100mslive/react-native-hms';
  
// add a event listener
instance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
  
```
