import { NativeEventEmitter, NativeModules } from 'react-native';
import HMSUpdateListenerActions from './HMSUpdateListenerActions';
import type HMSConfig from './HMSConfig';
import type HMSLocalPeer from './HMSLocalPeer';
import type HMSRemotePeer from './HMSRemotePeer';
import type HMSRoom from './HMSRoom';
import type HMSRole from './HMSRole';
import HMSEncoder from './HMSEncoder';
import HMSMessage from './HMSMessage';
import HMSHelper from './HMSHelper';
import type HMSTrack from './HMSTrack';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

const HmsEventEmitter = new NativeEventEmitter(HmsManager);

let HmsSdk: HMSSDK | undefined;

export default class HMSSDK {
  room?: HMSRoom;
  localPeer?: HMSLocalPeer;
  remotePeers?: HMSRemotePeer[];
  knownRoles?: HMSRole[];

  onPreviewDelegate?: any;
  onJoinDelegate?: any;
  onRoomDelegate?: any;
  onPeerDelegate?: any;
  onTrackDelegate?: any;
  onErrorDelegate?: any;
  onMessageDelegate?: any;
  onSpeakerDelegate?: any;
  onReconnectingDelegate?: any;
  onReconnectedDelegate?: any;
  onRoleChangeRequestDelegate?: any;
  onRemovedFromRoomDelegate?: any;

  /**
   * - Returns an instance of [HMSSDK]{@link HMSSDK}
   * - This function must be called to get an instance of HMSSDK class and only then user can interact with its methods
   *
   * @static
   * @returns
   * @memberof HMSSDK
   */
  static build() {
    if (HmsSdk) {
      return HmsSdk;
    }
    HmsManager.build();
    HmsSdk = new HMSSDK();
    return HmsSdk;
  }

  attachPreviewListener = () => {
    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      this.onPreviewListener
    );
  };

  attachListeners = () => {
    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_JOIN,
      this.onJoinListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      this.onRoomListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      this.onPeerListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      this.onTrackListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_ERROR,
      this.onErrorListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      this.onMessageListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      this.onSpeakerListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.RECONNECTING,
      this.reconnectingListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.RECONNECTED,
      this.reconnectedListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      this.onRoleChangeRequestListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      this.onRemovedFromRoomListener
    );
  };

  /**
   * takes an instance of [HMSConfig]{@link HMSConfig} and joins the room
   * after joining the room user will start receiving the events and updates of the room
   *
   * @param {HMSConfig} config
   * @memberof HMSSDK
   */
  join = async (config: HMSConfig) => {
    this.attachListeners();
    await HmsManager.join(config);
  };

  preview = (config: HMSConfig) => {
    this.attachPreviewListener();
    HmsManager.preview(config);
  };

  /**
   * Calls leave function of native sdk and session of current user is invalidated
   *
   * @memberof HMSSDK
   */
  leave = () => {
    HmsManager.leave();
  };

  sendBroadcastMessage = (message: String) => {
    HmsManager.sendBroadcastMessage({ message });
  };

  sendGroupMessage = (message: String, roles: HMSRole[]) => {
    HmsManager.sendGroupMessage({
      message,
      roles: HMSHelper.getRoleNames(roles),
    });
  };

  sendDirectMessage = (message: String, peerId: String) => {
    HmsManager.sendDirectMessage({
      message,
      peerId,
    });
  };

  changeRole = (peerId: String, role: String, force: boolean = false) => {
    const data = {
      peerId: peerId,
      role: role,
      force: force,
    };
    HmsManager.changeRole(data);
  };

  changeTrackState = (track: HMSTrack, mute: boolean) => {
    const data = {
      trackId: track.trackId,
      mute,
    };

    HmsManager.changeTrackState(data);
  };

  removePeer = (peerId: String, reason: String) => {
    const data = {
      peerId,
      reason,
    };

    HmsManager.removePeer(data);
  };

  endRoom = (lock: boolean, reason: String) => {
    const data = {
      lock,
      reason,
    };

    HmsManager.endRoom(data);
  };

  acceptRoleChange = () => {
    HmsManager.acceptRoleChange();
  };

  /**
   * - This is a prototype event listener that takes action and listens for updates related to that particular action
   * - This method will be @deprecated in future and event listener will be passed in join method
   *
   * @param {string} action
   * @param {*} callback
   * @memberof HMSSDK
   */
  addEventListener = (action: HMSUpdateListenerActions, callback: any) => {
    switch (action) {
      case HMSUpdateListenerActions.ON_PREVIEW:
        this.onPreviewDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_JOIN:
        this.onJoinDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_ROOM_UPDATE:
        this.onRoomDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_PEER_UPDATE:
        this.onPeerDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_TRACK_UPDATE:
        this.onTrackDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_ERROR:
        this.onErrorDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_MESSAGE:
        this.onMessageDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_SPEAKER:
        this.onSpeakerDelegate = callback;
        break;
      case HMSUpdateListenerActions.RECONNECTING:
        this.onReconnectingDelegate = callback;
        break;
      case HMSUpdateListenerActions.RECONNECTED:
        this.onReconnectedDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST:
        this.onRoleChangeRequestDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM:
        this.onRemovedFromRoomDelegate = callback;
        break;
      default:
    }
  };

  onPreviewListener = (data: any) => {
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );

    const previewTracks = HMSEncoder.encodeHmsPreviewTracks(data.previewTracks);

    this.localPeer = localPeer;
    this.room = room;
    if (this.onPreviewDelegate) {
      this.onPreviewDelegate({ ...data, room, localPeer, previewTracks });
    }
  };

  onJoinListener = (data: any) => {
    // Preprocessing
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers
    );
    const roles: HMSRole[] = HMSEncoder.encodeHmsRoles(data.roles);
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    this.knownRoles = roles;
    if (this.onJoinDelegate) {
      this.onJoinDelegate({ ...data, room, localPeer, remotePeers });
    }
  };

  onRoomListener = (data: any) => {
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers
    );
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onRoomDelegate) {
      this.onRoomDelegate({ ...data, room, localPeer, remotePeers });
    }
  };

  onPeerListener = (data: any) => {
    // const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers
    );
    // this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onPeerDelegate) {
      this.onPeerDelegate({ ...data, localPeer, remotePeers });
    }
  };

  onTrackListener = (data: any) => {
    // const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers
    );
    // this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onTrackDelegate) {
      this.onTrackDelegate({ ...data, localPeer, remotePeers });
    }
  };

  onMessageListener = (data: any) => {
    const message = new HMSMessage(data);
    if (this.onMessageDelegate) {
      this.onMessageDelegate(message);
    }
  };

  onSpeakerListener = (data: any) => {
    if (this.onSpeakerDelegate) {
      this.onSpeakerDelegate(data);
    }
  };

  onErrorListener = (data: any) => {
    if (this.onErrorDelegate) {
      this.onErrorDelegate(data);
    }
  };

  onRoleChangeRequestListener = (data: any) => {
    if (this.onRoleChangeRequestDelegate) {
      const encodedRoleChangeRequest =
        HMSEncoder.encodeHmsRoleChangeRequest(data);
      this.onRoleChangeRequestDelegate(encodedRoleChangeRequest);
    }
  };

  onRemovedFromRoomListener = (data: any) => {
    if (this.onRemovedFromRoomDelegate) {
      const requestedBy = HMSEncoder.encodeHmsPeer(data.requestedBy);
      const reason = data.reason;
      const roomEnded = data.roomEnded;

      this.onRemovedFromRoomDelegate({ requestedBy, reason, roomEnded });
    }
  };

  reconnectingListener = (data: any) => {
    if (this.onReconnectingDelegate) {
      this.onReconnectingDelegate(data);
    }
  };

  reconnectedListener = (data: any) => {
    if (this.onReconnectedDelegate) {
      this.onReconnectedDelegate(data);
    }
  };
}
