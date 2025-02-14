import { NativeModules } from 'react-native';
import HMSAudioTrack from './HMSAudioTrack';
import type HMSAudioTrackSettings from './HMSAudioTrackSettings';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

export default class HMSLocalAudioTrack extends HMSAudioTrack {
  settings?: HMSAudioTrackSettings;

  /**
   * Switches Audio of current user on/off depending upon the value of isMute
   *
   * @param {Boolean} isMute
   * @memberof HMSLocalAudioTrack
   */
  setMute(isMute: Boolean) {
    HmsManager.setLocalMute(isMute);
  }

  constructor(params: {
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: Boolean;
    settings?: HMSAudioTrackSettings;
  }) {
    super(params);
    this.settings = params.settings;
  }
}
