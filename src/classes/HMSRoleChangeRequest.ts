import type HMSRole from './HMSRole';
import type HMSPeer from './HMSPeer';

export default class HMSRoleChangeRequest {
  requestedBy: HMSPeer;
  suggestedRole: HMSRole;

  constructor(params: { requestedBy: HMSPeer; suggestedRole: HMSRole }) {
    this.requestedBy = params.requestedBy;
    this.suggestedRole = params.suggestedRole;
  }
}
