import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  SafeAreaView,
  Dimensions,
  BackHandler,
} from 'react-native';
import {connect} from 'react-redux';
import HmsManager, {
  HmsView,
  HMSUpdateListenerActions,
  HMSMessage,
} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ChatWindow from '../components/ChatWindow';
import AlertModal from '../components/AlertModal';
import Modal from '../components/Modal';
import Picker from '../components/Picker';
import {addMessage, clearMessageData} from '../redux/actions/index';
import {useNavigation} from '@react-navigation/native';
import dimension from '../utils/dimension';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {AppStackParamList} from '../navigator';
import {
  getRandomColor,
  getInitials,
  pairDataForFlatlist,
} from '../utils/functions';

type Peer = {
  trackId?: string;
  peerName?: string;
  isAudioMute?: boolean;
  isVideoMute?: boolean;
  peerId?: String;
  colour?: string;
  role?: any;
  sink: Boolean;
  type: 'local' | 'remote' | 'screen';
};

type Permissions = {
  changeRole: boolean;
  endRoom: boolean;
  removeOthers: boolean;
};

type DisplayNameProps = {
  peer?: Peer;
  videoStyles: Function;
  speakers: Array<String>;
  type: 'local' | 'remote' | 'screen';
  instance: any;
  permissions: Permissions;
};

type MeetingProps = {
  messages: any;
  addMessageRequest: Function;
  clearMessageRequest: Function;
  audioState: boolean;
  videoState: boolean;
  state: any;
};

const DEFAULT_PEER: Peer = {
  trackId: Math.random().toString(),
  peerName: Math.random().toString(),
  isAudioMute: true,
  isVideoMute: true,
  peerId: Math.random().toString(),
  colour: 'red',
  sink: true,
  role: 'host',
  type: 'local',
};

type MeetingScreenProp = StackNavigationProp<AppStackParamList, 'Meeting'>;

const DisplayName = ({
  peer,
  videoStyles,
  speakers,
  type,
  instance,
  permissions,
}: DisplayNameProps) => {
  const {
    peerName,
    isAudioMute,
    isVideoMute,
    trackId,
    colour,
    peerId,
    role,
    sink,
  } = peer!;
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [newRole, setNewRole] = useState(role?.name);
  const [force, setForce] = useState(false);

  const knownRoles = instance?.knownRoles || [];
  const speaking = speakers.includes(peerId!);
  const selectActionTitle = 'Select action';
  const selectActionMessage = '';
  const selectActionButtons: Array<{
    text: String;
    type?: String;
    onPress?: Function;
  }> = [{text: 'Cancel', type: 'cancel'}];
  if (permissions?.changeRole) {
    selectActionButtons.push(
      ...[
        {
          text: 'Prompt to change role',
          onPress: () => {
            setForce(false);
            setRoleModalVisible(true);
          },
        },
        {
          text: 'Force change',
          onPress: () => {
            setForce(true);
            setRoleModalVisible(true);
          },
        },
      ],
    );
  }
  if (permissions?.removeOthers) {
    selectActionButtons.push({
      text: 'Remove Participant',
      onPress: () => {
        instance?.removePeer(peerId, 'removed from room');
      },
    });
  }
  const roleRequestTitle = 'Select action';
  const roleRequestButtons: [
    {text: String; onPress?: Function},
    {text: String; onPress?: Function}?,
  ] = [
    {text: 'Cancel'},
    {
      text: 'Send',
      onPress: () => {
        instance?.changeRole(peerId, newRole, force);
      },
    },
  ];

  const promptUser = () => {
    setAlertModalVisible(true);
  };

  const {top, bottom} = useSafeAreaInsets();
  // window height - (bottom container + top + bottom + padding) / views in one screen
  const viewHeight =
    type === 'screen'
      ? Dimensions.get('window').height -
        (dimension.viewHeight(90) + top + bottom + 2)
      : (Dimensions.get('window').height -
          (dimension.viewHeight(90) + top + bottom + 2)) /
        2;

  return (
    <View
      key={trackId}
      style={[
        videoStyles(),
        {
          height: viewHeight,
        },
        speaking && styles.highlight,
      ]}>
      <AlertModal
        modalVisible={alertModalVisible}
        setModalVisible={setAlertModalVisible}
        title={selectActionTitle}
        message={selectActionMessage}
        buttons={selectActionButtons}
      />
      <Modal
        modalVisible={roleModalVisible}
        setModalVisible={setRoleModalVisible}
        title={roleRequestTitle}
        buttons={roleRequestButtons}>
        <Picker
          data={knownRoles}
          selectedItem={newRole}
          onItemSelected={setNewRole}
        />
      </Modal>
      {isVideoMute ? (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, {backgroundColor: colour}]}>
            <Text style={styles.avatarText}>{getInitials(peerName!)}</Text>
          </View>
        </View>
      ) : (
        <HmsView
          sink={sink}
          trackId={trackId}
          style={type === 'screen' ? styles.hmsViewScreen : styles.hmsView}
        />
      )}
      {type === 'remote' && selectActionButtons.length > 1 && (
        <TouchableOpacity onPress={promptUser} style={styles.optionsContainer}>
          <Entypo
            name="dots-three-horizontal"
            style={styles.options}
            size={20}
          />
        </TouchableOpacity>
      )}
      <View style={styles.displayContainer}>
        <View style={styles.peerNameContainer}>
          <Text numberOfLines={2} style={styles.peerName}>
            {peerName}
          </Text>
        </View>
        <View style={styles.micContainer}>
          <Feather
            name={isAudioMute ? 'mic-off' : 'mic'}
            style={styles.mic}
            size={20}
          />
        </View>
        <View style={styles.micContainer}>
          <Feather
            name={isVideoMute ? 'video-off' : 'video'}
            style={styles.mic}
            size={20}
          />
        </View>
      </View>
    </View>
  );
};

const peerColour: any = {};
const getPeerColour = (trackId: string): string => {
  let colour = 'red';
  if (peerColour[trackId]) {
    colour = peerColour[trackId];
  } else {
    colour = getRandomColor();
    peerColour[trackId] = colour;
  }
  return colour;
};

const Meeting = ({
  messages,
  addMessageRequest,
  clearMessageRequest,
}: MeetingProps) => {
  const [instance, setInstance] = useState<any>(null);
  const [trackId, setTrackId] = useState<Peer>(DEFAULT_PEER);
  const [remoteTrackIds, setRemoteTrackIds] = useState<Peer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [notification, setNotification] = useState(false);
  const [auxTracks, setAuxTracks] = useState<Peer[]>([]);
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    requestedBy?: String;
    suggestedRole?: String;
  }>({});
  const [roleChangeModalVisible, setRoleChangeModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [localPeerPermissions, setLocalPeerPermissions] = useState<Permissions>(
    {
      changeRole: false,
      endRoom: false,
      removeOthers: false,
    },
  );

  const roleChangeRequestTitle = 'Role Change Request';
  const roleChangeRequestButtons: [
    {text: String; onPress?: Function},
    {text: String; onPress?: Function},
  ] = [
    {text: 'Reject'},
    {
      text: 'Accept',
      onPress: () => {
        instance?.acceptRoleChange();
      },
    },
  ];

  const navigate = useNavigation<MeetingScreenProp>().navigate;

  const decode = (peer: any, type: 'local' | 'remote' | 'screen'): Peer => {
    const peerId = peer?.peerID;
    const peerTrackId = peer?.videoTrack?.trackId;
    const peerName = peer?.name;
    const peerIsAudioMute = peer?.audioTrack?.mute;
    const peerIsVideoMute = peer?.videoTrack?.mute;
    const peerRole = peer?.role;
    const newPeerColour = getPeerColour(peerTrackId);
    return {
      trackId: peerTrackId,
      peerName: peerName,
      isAudioMute: peerIsAudioMute,
      isVideoMute: peerIsVideoMute,
      peerId: peerId,
      colour: newPeerColour,
      sink: true,
      role: peerRole,
      type,
    };
  };

  const updateVideoIds = (remotePeers: any, localPeer: any) => {
    // get local track Id
    const localTrackId = localPeer?.videoTrack?.trackId;
    if (localTrackId) {
      setTrackId(decode(localPeer, 'local'));
    }
    const updatedLocalPeerPermissions = localPeer?.role?.permissions;
    setLocalPeerPermissions(updatedLocalPeerPermissions);

    const remoteVideoIds: Peer[] = [];
    let newAuxTracks: Peer[] = [];

    if (remotePeers) {
      remotePeers.map((remotePeer: any, index: number) => {
        const remoteTrackId = remotePeer?.videoTrack?.trackId;
        if (remoteTrackId) {
          remoteVideoIds.push(decode(remotePeer, 'remote'));
        } else {
          remoteVideoIds.push({
            ...decode(remotePeer, 'remote'),
            trackId: index.toString(),
          });
        }

        let auxiliaryTracks = remotePeer?.auxiliaryTracks;

        auxiliaryTracks.map((track: any) => {
          let auxTrackId = track?.trackId;

          if (auxTrackId) {
            newAuxTracks.push({
              trackId: auxTrackId,
              peerName: `${remotePeer?.name}'s Screen`,
              isAudioMute: true,
              isVideoMute: false,
              peerId: `${remotePeer?.peerID}_${auxTrackId}`,
              colour: 'red',
              sink: true,
              type: 'screen',
            });
          }
        });
        setAuxTracks(newAuxTracks);
      });

      setRemoteTrackIds(remoteVideoIds as []);
    }
  };

  const onJoinListener = ({
    localPeer,
    remotePeers,
  }: {
    room?: any;
    localPeer: any;
    remotePeers: any;
  }) => {
    console.log(localPeer, remotePeers, 'data in onJoin');
  };

  const onRoomListener = ({
    // room,
    localPeer,
    remotePeers,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onRoom');
  };

  const onPeerListener = ({
    // room,
    remotePeers,
    localPeer,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onPeer');
  };

  const onTrackListener = ({
    // room,
    remotePeers,
    localPeer,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onTrack');
  };

  const onMessage = (data: any) => {
    addMessageRequest({data, isLocal: false});
    setNotification(true);
    console.log(data, 'data in onMessage');
  };

  const onError = (data: any) => {
    console.log(data, 'data in onError');
  };

  const onSpeaker = (data: any) => {
    setSpeakers(data?.peers);
    console.log(data, 'data in onSpeaker');
  };

  const reconnecting = (data: any) => {
    console.log(data);
  };

  const reconnected = (data: any) => {
    console.log(data);
  };

  const onRoleChangeRequest = (data: any) => {
    console.log(data);
    setRoleChangeModalVisible(true);
    setRoleChangeRequest({
      requestedBy: data?.requestedBy?.name,
      suggestedRole: data?.suggestedRole?.name,
    });
  };

  const onRemovedFromRoom = (data: any) => {
    console.log(data);
    clearMessageRequest();
    navigate('WelcomeScreen');
  };

  const updateHmsInstance = async () => {
    const HmsInstance = await HmsManager.build();
    setInstance(HmsInstance);
    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      onRoomListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      onPeerListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      onTrackListener,
    );

    HmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      onMessage,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      onSpeaker,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.RECONNECTING,
      reconnecting,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.RECONNECTED,
      reconnected,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      onRoleChangeRequest,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      onRemovedFromRoom,
    );
  };

  useEffect(() => {
    updateHmsInstance();

    const backAction = () => {
      setLeaveModalVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instance) {
      const remotePeers = instance?.remotePeers ? instance.remotePeers : [];
      updateVideoIds(remotePeers, instance?.localPeer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  const getRemoteVideoStyles = () => {
    return styles.generalTile;
  };

  const getAuxVideoStyles = () => {
    return styles.fullScreenTile;
  };

  const getMessageToList = (): Array<{
    name: string;
    type: string;
    obj: any;
  }> => {
    const everyone = {
      name: 'everyone',
      type: 'everyone',
      obj: {},
    };
    const knownRoles = instance?.knownRoles.map((role: any) => ({
      name: role?.name,
      type: 'group',
      obj: role,
    }));
    const peers = remoteTrackIds.map(track => ({
      name: track?.peerName,
      type: 'direct',
      obj: track,
    }));
    return [everyone, ...knownRoles, ...peers];
  };

  const getButtons = ({endRoom}: Permissions) => {
    const buttons = [
      {
        text: 'Cancel',
        type: 'cancel',
      },
      {
        text: 'Leave without ending room',
        onPress: () => {
          instance.leave();
          clearMessageRequest();
          navigate('WelcomeScreen');
        },
      },
    ];
    if (endRoom) {
      buttons.push({
        text: 'End Room for all',
        onPress: () => {
          instance.endRoom(false, 'Host ended the room');
          clearMessageRequest();
          navigate('WelcomeScreen');
        },
      });
    }
    return buttons;
  };

  const onViewRef = React.useRef(({viewableItems}: any) => {
    if (viewableItems) {
      const viewableItemsIds: (string | undefined)[] = [];
      const names: (string | undefined)[] = [];
      viewableItems.map(
        (viewableItem: {
          index: Number;
          item: {first: Peer; second: Peer | undefined};
          key: String;
          isViewable: Boolean;
        }) => {
          viewableItemsIds.push(viewableItem?.item?.first?.trackId);
          names.push(viewableItem?.item?.first?.peerName);
          if (viewableItem?.item?.second) {
            viewableItemsIds.push(viewableItem?.item?.second?.trackId);
            names.push(viewableItem?.item?.second?.peerName);
          }
        },
      );

      const inst = HmsManager.build();
      const remotePeers = inst?.remotePeers;
      if (remotePeers) {
        const sinkRemoteTrackIds = remotePeers.map((peer: Peer) => {
          const remotePeer = decode(peer, 'remote');
          const videoTrackId = remotePeer.trackId;
          if (!viewableItemsIds?.includes(videoTrackId)) {
            return {
              ...remotePeer,
              sink: false,
            };
          }
          return remotePeer;
        });
        setRemoteTrackIds(sinkRemoteTrackIds ? sinkRemoteTrackIds : []);
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        modalVisible={roleChangeModalVisible}
        setModalVisible={setRoleChangeModalVisible}
        title={roleChangeRequestTitle}
        buttons={roleChangeRequestButtons}>
        <Text style={styles.roleChangeText}>
          Role change requested by {roleChangeRequest?.requestedBy}. Changing
          role to {roleChangeRequest?.suggestedRole}
        </Text>
      </Modal>
      <AlertModal
        modalVisible={leaveModalVisible}
        setModalVisible={setLeaveModalVisible}
        title="End Room"
        message=""
        buttons={getButtons(localPeerPermissions)}
      />
      <View style={styles.wrapper}>
        <FlatList
          data={pairDataForFlatlist([...auxTracks, trackId, ...remoteTrackIds])}
          renderItem={({item}) => {
            if (item?.second) {
              const {first, second} = item;

              return (
                <View style={styles.rowWrapper}>
                  <DisplayName
                    peer={first}
                    videoStyles={
                      first.type === 'screen'
                        ? getAuxVideoStyles
                        : getRemoteVideoStyles
                    }
                    speakers={speakers}
                    instance={instance}
                    type={first.type}
                    permissions={localPeerPermissions}
                  />
                  <DisplayName
                    peer={second}
                    videoStyles={
                      second.type === 'screen'
                        ? getAuxVideoStyles
                        : getRemoteVideoStyles
                    }
                    speakers={speakers}
                    instance={instance}
                    type={second.type}
                    permissions={localPeerPermissions}
                  />
                </View>
              );
            } else {
              const {first} = item;
              return (
                <DisplayName
                  peer={first}
                  videoStyles={
                    first.type === 'screen'
                      ? getAuxVideoStyles
                      : getRemoteVideoStyles
                  }
                  speakers={speakers}
                  instance={instance}
                  type={first.type}
                  permissions={localPeerPermissions}
                />
              );
            }
          }}
          numColumns={1}
          onViewableItemsChanged={onViewRef.current}
          keyExtractor={item => item?.first?.trackId!}
        />
      </View>
      <View style={styles.iconContainers}>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={async () => {
            setTrackId({
              ...trackId,
              isAudioMute: !trackId.isAudioMute,
            });
            instance.localPeer.localAudioTrack().setMute(!trackId.isAudioMute);
          }}>
          <Feather
            name={trackId.isAudioMute ? 'mic-off' : 'mic'}
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setModalVisible(true);
          }}>
          <Feather
            name="message-circle"
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
          {notification && <View style={styles.messageDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            instance.localPeer.localVideoTrack().switchCamera();
          }}>
          <Ionicons
            name="camera-reverse-outline"
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setTrackId({
              ...trackId,
              isVideoMute: !trackId.isVideoMute,
            });
            instance.localPeer.localVideoTrack().setMute(!trackId.isVideoMute);
          }}>
          <Feather
            name={trackId.isVideoMute ? 'video-off' : 'video'}
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.leaveIconContainer}
          onPress={async () => {
            setLeaveModalVisible(true);
          }}>
          <Feather
            name="phone-off"
            style={styles.leaveIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
      </View>
      {modalVisible && (
        <ChatWindow
          messages={messages}
          cancel={() => {
            setModalVisible(false);
            setNotification(false);
          }}
          messageToList={getMessageToList()}
          send={(
            value: string,
            messageTo: {name: string; type: string; obj: any},
          ) => {
            if (value.length > 0) {
              const hmsMessage = new HMSMessage({
                type: 'chat',
                time: new Date().toISOString(),
                message: value,
              });
              if (messageTo?.type === 'everyone') {
                instance.sendBroadcastMessage(value);
              } else if (messageTo?.type === 'group') {
                instance.sendGroupMessage(value, [messageTo?.obj]);
              } else if (messageTo.type === 'direct') {
                instance.sendDirectMessage(value, messageTo?.obj?.peerId);
              }
              addMessageRequest({
                data: hmsMessage,
                isLocal: true,
                name: messageTo?.name,
              });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: dimension.viewHeight(896),
  },
  videoView: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  videoIcon: {},
  fullScreenTile: {
    height: dimension.viewHeight(896),
    width: dimension.viewWidth(414),
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
  },
  generalTile: {
    width: dimension.viewWidth(206),
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
  },
  hmsView: {
    height: '100%',
    width: '100%',
  },
  hmsViewScreen: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  iconContainers: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: dimension.viewHeight(22),
    paddingTop: dimension.viewHeight(15),
    width: '100%',
    backgroundColor: 'white',
    height: dimension.viewHeight(90),
  },

  buttonText: {
    backgroundColor: '#4578e0',
    padding: 10,
    borderRadius: 10,
    color: '#efefef',
  },

  leaveIconContainer: {
    backgroundColor: '#ee4578',
    padding: dimension.viewHeight(10),
    borderRadius: 50,
  },
  singleIconContainer: {
    padding: dimension.viewHeight(10),
  },
  leaveIcon: {
    color: 'white',
  },

  cameraImage: {
    width: dimension.viewHeight(30),
    height: dimension.viewHeight(30),
  },
  scroll: {
    width: '100%',
  },
  wrapper: {
    flex: 1,
  },
  displayContainer: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: 'rgba(137,139,155,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerName: {
    color: '#4578e0',
  },
  peerNameContainer: {
    maxWidth: 80,
  },
  micContainer: {
    paddingHorizontal: 3,
  },
  mic: {
    color: '#4578e0',
  },
  avatarContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    aspectRatio: 1,
    width: '50%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    color: 'white',
  },
  highlight: {
    backgroundColor: '#4578e0',
    padding: 5,
    borderRadius: 10,
  },
  messageDot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'red',
    right: dimension.viewWidth(10),
    top: dimension.viewHeight(10),
  },
  options: {
    color: 'white',
  },
  optionsContainer: {
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  roleChangeText: {
    padding: 12,
  },
  rowWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

const mapDispatchToProps = (dispatch: Function) => ({
  addMessageRequest: (data: any) => dispatch(addMessage(data)),
  clearMessageRequest: () => dispatch(clearMessageData()),
});

const mapStateToProps = (state: any) => ({
  messages: state?.messages?.messages,
  audioState: state?.app?.audioState,
  videoState: state?.app?.videoState,
});

export default connect(mapStateToProps, mapDispatchToProps)(Meeting);
